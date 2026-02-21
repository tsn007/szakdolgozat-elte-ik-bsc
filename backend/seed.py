import os
import django
import random
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'community_sharing.settings') 
django.setup()

from faker import Faker
from categories.models import Category
from items.models import Item
from users.models import User

def run_seed():
    print("Booting up the seeder...")
    fake = Faker()
    
    print("Generating 5 new Categories...")
    categories_to_create = []
    
    for _ in range(5):
        cat_name = fake.word()

        category = Category(
            id=fake.uuid4(),
            name=cat_name,
            slug=slugify(cat_name)
        )
        categories_to_create.append(category)
        
    Category.objects.bulk_create(categories_to_create)
    
    categories = list(Category.objects.all())
    users = list(User.objects.all())

    if not categories or not users:
        print("Error: You must have at least one User and Category in the DB first!")
        return

    print("Generating 50 new Items...")
    items_to_create = []

    for _ in range(50):
        item = Item(
            id=fake.uuid4(),
            category=random.choice(categories),
            name=fake.catch_phrase(),
            price=fake.pydecimal(left_digits=3, right_digits=2, positive=True),
            owner=random.choice(users),
            latitude=fake.latitude(),
            longitude=fake.longitude(),
        )
        items_to_create.append(item)

    Item.objects.bulk_create(items_to_create)
    print("Successfully seeded Items!")

if __name__ == '__main__':
    run_seed()