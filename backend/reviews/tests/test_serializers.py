from reviews.serializers import CreateReviewSerializer

class TestCreateReviewSerializer:
    
    def test_valid_review_data(self):
        data = {
            "content": "Kiváló szolgáltatás, nagyon elégedett vagyok!",
            "point": 4.5
        }
        serializer = CreateReviewSerializer(data=data)
        assert serializer.is_valid() is True

    def test_missing_required_point(self):
        data = {
            "content": "Jó volt, de elfelejtettem pontot adni."
        }
        serializer = CreateReviewSerializer(data=data)
        assert serializer.is_valid() is False
        assert "point" in serializer.errors
        assert serializer.errors["point"][0].code == "required"

    def test_invalid_point_type(self):
        data = {
            "content": "Ez egy értékelés.",
            "point": "öt és fél"
        }
        serializer = CreateReviewSerializer(data=data)
        assert serializer.is_valid() is False
        assert "point" in serializer.errors
        assert serializer.errors["point"][0].code == "invalid"

    def test_point_type_conversion(self):
        data = {
            "content": "Rendben volt minden.",
            "point": "5.0"
        }
        serializer = CreateReviewSerializer(data=data)
        assert serializer.is_valid() is True
        assert isinstance(serializer.validated_data['point'], float)
        assert serializer.validated_data['point'] == 5.0