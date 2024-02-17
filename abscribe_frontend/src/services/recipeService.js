import apiClient from "./abscribeAPI";
import data from "bootstrap/js/src/dom/data";
export let recipeService = {
    async getRecipe(recipeId) {
        let response = await(apiClient.get(`/recipes/${recipeId}`));
        return response.data;
    },
    async getRecipes()  {
        /** Get literally every recipe from the backend. **/
        let response = await(apiClient.get(`/recipes/`));
        console.log("Our recipes retrieved:" + response.data);
        return response.data;
    },
    // We lowkey don't need to do anything with the promises. We're just signalling the back-end, I think.
    deleteRecipe(recipe_id) {
        (apiClient.delete(`/recipes/delete/${recipe_id}`));
    },
    createRecipe(id, name, prompt, homeDocumentId) {
        apiClient.post(`/recipes/create`, {
            id: id,
            name: name,
            prompt: prompt,
            home_document_id: homeDocumentId
        });
    },
    updateRecipe(recipe_id, new_name, new_prompt) {
        apiClient.post(`/recipes/update`, {
            recipe_id: recipe_id,
            new_name: new_name,
            new_prompt: new_prompt
        });
    }
}
