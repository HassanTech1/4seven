from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production-7777')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI()

# Create router with /api prefix
api_router = APIRouter(prefix="/api")


# ===================== MODELS =====================

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AddressCreate(BaseModel):
    title: str  # Home, Work, etc.
    full_name: str
    phone: str
    street: str
    city: str
    region: str
    postal_code: Optional[str] = None
    is_default: bool = False

class AddressResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    full_name: str
    phone: str
    street: str
    city: str
    region: str
    postal_code: Optional[str] = None
    is_default: bool

# Cart & Checkout Models
class CartItem(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    size: str
    image: Optional[str] = None

class ShippingAddress(BaseModel):
    email: str
    first_name: str
    last_name: str
    address: str
    apartment: Optional[str] = None
    city: str
    region: str
    postal_code: Optional[str] = None
    phone: str
    country: str = "Saudi Arabia"

class CheckoutRequest(BaseModel):
    origin_url: str
    items: List[CartItem]
    shipping_address: Optional[ShippingAddress] = None
    discount_code: Optional[str] = None

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: Optional[str] = None
    amount: float
    currency: str
    items: List[Dict]
    status: str = "pending"
    payment_status: str = "initiated"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Wishlist Model
class WishlistItem(BaseModel):
    product_id: int
    name: str
    price: float
    image: str

# Search Model
class SearchQuery(BaseModel):
    query: str
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None

# Product Model (for search results)
class Product(BaseModel):
    id: int
    name: str
    nameEn: str
    category: str
    price: float
    image: str
    isNew: bool = False


# ===================== AUTH HELPERS =====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        return user
    except JWTError:
        return None

async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


# ===================== MOCK PRODUCTS DATA =====================

PRODUCTS = [
    {"id": 1, "name": "حقيبة جلدية فاخرة", "nameEn": "Luxury Leather Bag", "category": "bags", "price": 1299, "image": "https://images.unsplash.com/photo-1589363358751-ab05797e5629", "isNew": True},
    {"id": 2, "name": "حقيبة يد كلاسيكية", "nameEn": "Classic Handbag", "category": "bags", "price": 899, "image": "https://images.unsplash.com/photo-1587467512961-120760940315", "isNew": False},
    {"id": 3, "name": "حقيبة كتف عصرية", "nameEn": "Modern Shoulder Bag", "category": "bags", "price": 749, "image": "https://images.unsplash.com/photo-1591348278900-019a8a2a8b1d", "isNew": True},
    {"id": 4, "name": "قميص صيفي أنيق", "nameEn": "Elegant Summer Shirt", "category": "shirts", "price": 299, "image": "https://images.unsplash.com/photo-1715533173683-737d4a2433dd", "isNew": True},
    {"id": 5, "name": "جاكيت رسمي", "nameEn": "Formal Jacket", "category": "jackets", "price": 599, "image": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e", "isNew": False},
    {"id": 6, "name": "بنطلون كلاسيكي", "nameEn": "Classic Pants", "category": "pants", "price": 399, "image": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04", "isNew": True},
    {"id": 7, "name": "حقيبة ظهر عملية", "nameEn": "Practical Backpack", "category": "bags", "price": 549, "image": "https://images.unsplash.com/photo-1590739225287-bd31519780c3", "isNew": False},
    {"id": 8, "name": "قميص قطني فاخر", "nameEn": "Premium Cotton Shirt", "category": "shirts", "price": 349, "image": "https://images.unsplash.com/photo-1716951220992-2bbe913ddbf8", "isNew": True},
    {"id": 9, "name": "جاكيت كاجوال", "nameEn": "Casual Jacket", "category": "jackets", "price": 699, "image": "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd", "isNew": False},
    {"id": 10, "name": "بنطلون صيفي خفيف", "nameEn": "Light Summer Pants", "category": "pants", "price": 449, "image": "https://images.unsplash.com/photo-1716951988375-37d5793385d0", "isNew": True},
    {"id": 11, "name": "قميص بولو أنيق", "nameEn": "Elegant Polo Shirt", "category": "shirts", "price": 279, "image": "https://images.unsplash.com/photo-1716951918731-77d7682b4e63", "isNew": False},
    {"id": 12, "name": "جاكيت جلدي فاخر", "nameEn": "Luxury Leather Jacket", "category": "jackets", "price": 1499, "image": "https://images.unsplash.com/photo-1686491730848-0c86413833e5", "isNew": True},
]


# ===================== ROUTES =====================

# Basic Routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ===================== AUTH ROUTES =====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email.lower(),
        "password": get_password_hash(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "created_at": now,
        "updated_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            email=user_doc["email"],
            name=user_doc["name"],
            phone=user_doc["phone"],
            created_at=now
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            phone=user.get("phone"),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(require_auth)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        phone=user.get("phone"),
        created_at=user["created_at"]
    )

@api_router.put("/auth/profile")
async def update_profile(
    name: Optional[str] = None,
    phone: Optional[str] = None,
    user: dict = Depends(require_auth)
):
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if name:
        update_data["name"] = name
    if phone:
        update_data["phone"] = phone
    
    await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    return {"message": "Profile updated successfully"}


# ===================== SEARCH ROUTES =====================

@api_router.get("/products/search")
async def search_products(
    q: str = "",
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    results = []
    query_lower = q.lower()
    
    for product in PRODUCTS:
        # Text search (name in Arabic or English)
        if query_lower and query_lower not in product["name"].lower() and query_lower not in product["nameEn"].lower():
            continue
        
        # Category filter
        if category and product["category"] != category:
            continue
        
        # Price filters
        if min_price and product["price"] < min_price:
            continue
        if max_price and product["price"] > max_price:
            continue
        
        results.append(product)
    
    return {"products": results, "total": len(results)}

@api_router.get("/products/{product_id}")
async def get_product(product_id: int):
    for product in PRODUCTS:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")

@api_router.get("/products")
async def get_all_products(category: Optional[str] = None):
    if category:
        return {"products": [p for p in PRODUCTS if p["category"] == category]}
    return {"products": PRODUCTS}

@api_router.get("/categories")
async def get_categories():
    return {
        "categories": [
            {"id": "bags", "name": "الحقائب", "nameEn": "Bags"},
            {"id": "jackets", "name": "الجاكيتات", "nameEn": "Jackets"},
            {"id": "shirts", "name": "القمصان", "nameEn": "Shirts"},
            {"id": "pants", "name": "البناطيل", "nameEn": "Pants"},
        ]
    }


# ===================== WISHLIST ROUTES =====================

@api_router.get("/wishlist")
async def get_wishlist(user: dict = Depends(require_auth)):
    wishlist = await db.wishlists.find_one({"user_id": user["id"]}, {"_id": 0})
    if not wishlist:
        return {"items": []}
    return {"items": wishlist.get("items", [])}

@api_router.post("/wishlist/add")
async def add_to_wishlist(item: WishlistItem, user: dict = Depends(require_auth)):
    wishlist = await db.wishlists.find_one({"user_id": user["id"]})
    
    if not wishlist:
        await db.wishlists.insert_one({
            "user_id": user["id"],
            "items": [item.model_dump()],
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    else:
        # Check if item already exists
        existing = [i for i in wishlist.get("items", []) if i["product_id"] == item.product_id]
        if not existing:
            await db.wishlists.update_one(
                {"user_id": user["id"]},
                {
                    "$push": {"items": item.model_dump()},
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                }
            )
    
    return {"message": "Added to wishlist"}

@api_router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: int, user: dict = Depends(require_auth)):
    await db.wishlists.update_one(
        {"user_id": user["id"]},
        {
            "$pull": {"items": {"product_id": product_id}},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    return {"message": "Removed from wishlist"}


# ===================== ADDRESS ROUTES =====================

@api_router.get("/addresses")
async def get_addresses(user: dict = Depends(require_auth)):
    addresses = await db.addresses.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return {"addresses": addresses}

@api_router.post("/addresses", response_model=AddressResponse)
async def add_address(address: AddressCreate, user: dict = Depends(require_auth)):
    address_id = str(uuid.uuid4())
    
    # If this is the first address or marked as default, set others to non-default
    if address.is_default:
        await db.addresses.update_many(
            {"user_id": user["id"]},
            {"$set": {"is_default": False}}
        )
    
    address_doc = {
        "id": address_id,
        "user_id": user["id"],
        **address.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.addresses.insert_one(address_doc)
    
    return AddressResponse(id=address_id, **address.model_dump())

@api_router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user: dict = Depends(require_auth)):
    result = await db.addresses.delete_one({"id": address_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address deleted"}


# ===================== ORDER HISTORY ROUTES =====================

@api_router.get("/orders")
async def get_orders(user: dict = Depends(require_auth)):
    orders = await db.orders.find(
        {"user_id": user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"orders": orders}

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(require_auth)):
    order = await db.orders.find_one(
        {"id": order_id, "user_id": user["id"]},
        {"_id": 0}
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ===================== CHECKOUT ROUTES =====================

@api_router.post("/checkout/create-session")
async def create_checkout_session(
    request: Request, 
    checkout_req: CheckoutRequest,
    user: Optional[dict] = Depends(get_current_user)
):
    try:
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        if not stripe_api_key:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        total_amount = sum(item.price * item.quantity for item in checkout_req.items)
        
        success_url = f"{checkout_req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{checkout_req.origin_url}/checkout/cancel"
        
        metadata = {
            "source": "7777_store",
            "items_count": str(len(checkout_req.items))
        }
        if user:
            metadata["user_id"] = user["id"]
        
        checkout_request = CheckoutSessionRequest(
            amount=float(total_amount),
            currency="sar",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create order and transaction records
        order_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        order_doc = {
            "id": order_id,
            "user_id": user["id"] if user else None,
            "session_id": session.session_id,
            "items": [item.model_dump() for item in checkout_req.items],
            "shipping_address": checkout_req.shipping_address.model_dump() if checkout_req.shipping_address else None,
            "discount_code": checkout_req.discount_code,
            "subtotal": total_amount,
            "tax": total_amount * 0.15,  # 15% VAT
            "shipping_cost": 0.0,  # Free shipping
            "total": total_amount * 1.15,  # Including tax
            "currency": "SAR",
            "status": "pending",
            "payment_status": "initiated",
            "created_at": now,
            "updated_at": now
        }
        
        await db.orders.insert_one(order_doc)
        
        transaction = PaymentTransaction(
            session_id=session.session_id,
            user_id=user["id"] if user else None,
            amount=total_amount,
            currency="sar",
            items=[item.model_dump() for item in checkout_req.items],
            status="pending",
            payment_status="initiated"
        )
        
        doc = transaction.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.payment_transactions.insert_one(doc)
        
        return {
            "url": session.url,
            "session_id": session.session_id,
            "order_id": order_id
        }
        
    except Exception as e:
        logging.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(request: Request, session_id: str):
    try:
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        if not stripe_api_key:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction and order status
        update_data = {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        
        await db.orders.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        
        return {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status,
            "amount_total": checkout_status.amount_total,
            "currency": checkout_status.currency,
            "metadata": checkout_status.metadata
        }
        
    except Exception as e:
        logging.error(f"Error getting checkout status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        if not stripe_api_key:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.event_type == "checkout.session.completed":
            update_data = {
                "status": "completed",
                "payment_status": webhook_response.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": update_data}
            )
            
            await db.orders.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": update_data}
            )
        
        return {"status": "processed"}
        
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
