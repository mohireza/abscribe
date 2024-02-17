import unittest

from abscribe_backend.services.recipe_service import get_recipe, get_recipes, Recipe, create_recipe, delete_recipe, \
    update_recipe


class TestRecipeService(unittest.TestCase):
    test_recipe = Recipe(frontend_id="123", name="test", prompt="hardcode me a test recipe!")

    def test_recipe_creation(self):
        self.assertEqual(self.test_recipe, create_recipe(123, "test", "hardcode me a test recipe!"))
        self.assertEqual(get_recipe(recipe_name="test"), self.test_recipe)
        return

    def test_recipe_deletion(self):
        create_recipe(123, "test", "hardcode me a test recipe!")
        self.assertTrue(delete_recipe("test"))
        self.assertIsNone(get_recipe("name"))
        return

    def test_recipe_update(self):
        create_recipe(123, "test", "hardcode me a test recipe!")
        update_recipe("test", 321, "nuTest", "hardcoded!")
        self.assertEqual(get_recipe(recipe_name="nuTest"), Recipe(321, "nuTest", "hardcoded!"))
        return

    def test_recipe_retrieval(self):
        create_recipe(123, "test", "hardcode me a test recipe!")
        self.assertEqual(get_recipe("test"), self.test_recipe)
        return

    def test_recipe_dump(self):
        create_recipe(1, "test", "hardcode me a test recipe!")
        create_recipe(2, "test", "hardcode me a test recipe!")
        create_recipe(3, "test", "hardcode me a test recipe!")

        self.assertEqual(get_recipes(),
                         [Recipe(1, "test", "hardcode me a test recipe!"),
                          Recipe(2, "test", "hardcode me a test recipe!"),
                          Recipe(3, "test", "hardcode me a test recipe!")])
        return

    def setUp(self) -> None:
        super().setUp()

    def tearDown(self) -> None:
        super().tearDown()
        for recipe in Recipe.objects():
            recipe.delete()


if __name__ == "__main__":
    unittest.main()
