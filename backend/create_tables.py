from app.db.database import (
    engine,
)

from app.db.base import (
    Base,
)

from app.models.transaction import (
    Transaction,
)

from app.models.merchant_memory import (
    MerchantMemory,
)

Base.metadata.create_all(
    bind=engine
)

print("Tables Created Successfully")
