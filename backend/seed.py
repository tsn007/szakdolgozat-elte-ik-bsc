import os
import uuid
import django
import random
from django.conf import settings
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'community_sharing.settings') 
django.setup()

from faker import Faker
from categories.models import Category
from items.models import Item, ItemImage, Location
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
    
    users = list(User.objects.all())
    locations_to_create = []
    for i in users:
        location = Location(
            id=fake.uuid4(),
            user=i,
            label=fake.word(),
            address=fake.address(),
            lat=fake.latitude(),
            lng=fake.longitude()
        )
        locations_to_create.append(location)

    Location.objects.bulk_create(locations_to_create) #type: ignore

    categories = list(Category.objects.all())
    locations = list(Location.objects.all()) #type: ignore

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
            price=fake.pydecimal(left_digits=2, right_digits=2, positive=True),
            owner=random.choice(users),
            cover='items/covers/placeholder.png',
            location = random.choice(locations), #type: ignore
        )
        items_to_create.append(item)

    Item.objects.bulk_create(items_to_create)

    upload_folder = 'items/gallery/'
    absolute_path = os.path.join(settings.MEDIA_ROOT, upload_folder)

    items = list(Item.objects.all())
    imgs_to_create = []
    for _ in range(50):
        filename = f"{uuid.uuid4()}.png"
        full_file_path = os.path.join(absolute_path, filename)
        image_bytes = fake.image(size=(800, 600), image_format='png') 
        with open(full_file_path, 'wb') as f:
            f.write(image_bytes)
        
        relative_db_path = os.path.join(upload_folder, filename)
        img = ItemImage(
            id=fake.uuid4(),
            item=random.choice(items),
            image=relative_db_path
        )
        imgs_to_create.append(img)

    ItemImage.objects.bulk_create(imgs_to_create) #type: ignore
    print("Successfully seeded Items!")

if __name__ == '__main__':
    run_seed()