from typing import Optional, List
from abscribe_backend.models.recipe import Recipe
from datetime import datetime
from datetime import timezone


def create_recipe(frontend_id, name, prompt, home_document_id) -> Recipe:
    """Adds a recipe to the database, given all the necessary parameters."""
    new_recipe = Recipe(frontend_id=frontend_id, name=name, prompt=prompt,
                        creation_timestamp=datetime.now(timezone.utc), edit_timestamp=datetime.now(timezone.utc),
                        home_document_id=home_document_id)
    new_recipe.save()
    return new_recipe


def get_recipes() -> List[Recipe]:
    """Get every recipe from the database."""
    return [recipe_item for recipe_item in Recipe.objects]


def get_recipe(recipe_id) -> Recipe:
    """Get a specific recipe from the database."""
    recipe = Recipe.objects(frontend_id=recipe_id).first()
    return recipe


def delete_recipe(recipe_id) -> bool:
    """Delete a specific recipe from the database by name."""
    result = Recipe.objects(frontend_id=recipe_id).delete()
    return result > 0


def update_recipe(recipe_id, new_name=None, new_prompt=None) -> Recipe:
    """Update a specific recipe in the database, searching by ID. If you don't want to update a field, don't specify
    it."""
    recipe_to_update = Recipe.objects(frontend_id=recipe_id).first()
    if new_name:
        recipe_to_update.name = new_name
    if new_prompt:
        recipe_to_update.prompt = new_prompt
    recipe_to_update.edit_timestamp = datetime.now(timezone.utc)
    recipe_to_update.save()
    return recipe_to_update


def remove_all_recipes():
    """Remove literally every recipe in the database. This was created mostly for testing but might be useful in
    the real app too. Careful!"""
    for recipe in Recipe.objects():
        recipe.delete()
