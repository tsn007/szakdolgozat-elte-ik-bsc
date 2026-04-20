import pytest
from unittest.mock import MagicMock

from categories.serializers import AllCategoriesResponseSerializer, ItemCategorySerializer

class TestAllCategoriesResponseSerializer:

    def test_category_serialization_includes_slug(self):
        """Verifies that id, name, and slug are correctly mapped to JSON."""
        
        mock_category = MagicMock()
        mock_category.id = 1
        mock_category.name = "Electronics"
        mock_category.slug = "electronics"

        serializer = AllCategoriesResponseSerializer(mock_category)
        data = serializer.data

        assert data["id"] == "1"
        assert data["name"] == "Electronics"
        assert data["slug"] == "electronics"

class TestItemCategorySerializer:

    def test_category_serialization_excludes_slug(self):
        """
        Verifies that the limited serializer only returns id and name, 
        and specifically excludes the slug to save bandwidth on nested items.
        """
        mock_category = MagicMock()
        mock_category.id = 2
        mock_category.name = "Power Tools"
        mock_category.slug = "power-tools"

        serializer = ItemCategorySerializer(mock_category)
        data = serializer.data

        assert data["id"] == "2"
        assert data["name"] == "Power Tools"

        assert "slug" not in data