from django.contrib import admin

from items.models import Item, ItemImage, Location

admin.site.register(Item)
admin.site.register(Location)
admin.site.register(ItemImage)
