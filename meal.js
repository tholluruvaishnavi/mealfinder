const categoryURL = "https://www.themealdb.com/api/json/v1/1/categories.php";
const searchURL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const filterURL = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const detailURL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

const categoriesDiv = document.getElementById("categories");
const mealsSection = document.getElementById("meal-section");
const mealDetails = document.getElementById("meal-details");
const menu = document.getElementById("menu");

function toggleMenu() {
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function createCategoryMenu(categories) {
  menu.innerHTML = `
    <div class="menu-close" onclick="toggleMenu()"><i class="fa-solid fa-xmark"></i></div>
    ${categories
      .map(cat => `<a href="#" onclick="loadMealsByCategory('${cat.strCategory}')">${cat.strCategory}</a>`)
      .join("")}
  `;
}

async function loadCategories() {
  try {
    const res = await fetch(categoryURL);
    const data = await res.json();
    categoriesDiv.innerHTML = data.categories
      .map(cat => `
        <div class="category-card" onclick="loadMealsByCategory('${cat.strCategory}')">
          <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}">
          <p>${cat.strCategory}</p>
        </div>
      `)
      .join("");
    createCategoryMenu(data.categories);
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function handleEnterKey(event) {
  if (event.key === "Enter") searchMeal();
}

async function searchMeal() {
  const input = document.getElementById("searchInput").value.trim();
  if (!input) return;
  try {
    const res = await fetch(`${searchURL}${input}`);
    const data = await res.json();
    displayMeals(data.meals, `Search results for "${input}"`);
  } catch (error) {
    console.error("Error searching meals:", error);
  }
}

async function loadMealsByCategory(category) {
  try {
    const mealRes = await fetch(`${filterURL}${category}`);
    const mealData = await mealRes.json();

    const catRes = await fetch(categoryURL);
    const catData = await catRes.json();
    const selectedCategory = catData.categories.find(c => c.strCategory === category);

    const categoryDescription = `
      <div style="grid-column: 1/-1;">
        <h3 class="section-title">${selectedCategory.strCategory}</h3>
        <p style="margin-bottom: 1rem;">${selectedCategory.strCategoryDescription}</p>
      </div>
    `;

    displayMeals(mealData.meals, category, categoryDescription);
    menu.style.display = "none";
    mealsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("Error loading meals by category:", error);
  }
}

function displayMeals(meals, title = "Meals", extraContent = "") {
  mealDetails.style.display = "none";
  mealsSection.innerHTML = meals
    ? `
      ${extraContent}
      ${meals.map(meal => `
        <div class="meal-card" onclick="loadMealDetail('${meal.idMeal}')">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <p>${meal.strMeal}</p>
        </div>
      `).join("")}
    `
    : `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
        <h3 class="section-title">${title}</h3>
        <p>No meals found.</p>
      </div>
    `;
}

async function loadMealDetail(id) {
  try {
    const res = await fetch(`${detailURL}${id}`);
    const data = await res.json();
    const meal = data.meals[0];

    const ingredients = [];
    const measures = [];

    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push(ing.trim());
        measures.push(measure ? measure.trim() : "");
      }
    }

    mealsSection.innerHTML = "";
    mealDetails.style.display = "block";

    mealDetails.innerHTML = `
      <div class="meal-header orange-bar">
        <h3>MEAL DETAILS</h3>
      </div>

      <div class="meal-detail-container">
        <div class="meal-img">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        </div>
        <div class="meal-info">
          <h3>${meal.strMeal}</h3>
          <p><strong>CATEGORY:</strong> ${meal.strCategory}</p>
          <p><strong>Source:</strong> <a href="${meal.strSource}" target="_blank">${meal.strSource}</a></p>
          <p><strong>Area:</strong> ${meal.strArea}</p>
          <p><strong>Tags:</strong><span class="str-tags"> ${meal.strTags || "N/A"}</span></p>

          <div class="ingredients-box">
            <h4>Ingredients</h4>
            <ol class="ingredient-list">
              ${ingredients.map(ing => `<li>${ing}</li>`).join("")}
            </ol>
          </div>
        </div>
      </div>

      <div class="measure-box">
        <h4>Measure:</h4>
        <div class="measure-list">
          ${measures.map(m =>` <li>🔸 ${m}</li>`).join("")}
        </div>
      </div>

      <div class="meal-instructions">
        <h4>Instructions:</h4>
        ${meal.strInstructions
        .split("\n")
        .filter(p => p.trim())
        .map(p =>` <p><i class="fa-solid fa-circle-check"></i> ${p}</p>`)
        .join("")}
      </div>

      <button class="back-btn" onclick="goBack()">
        <i class="fa-solid fa-arrow-left"></i> Back to Meals
      </button>
    `;

    mealDetails.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("Error loading meal details:", error);
  }
}

function goBack() {
  mealDetails.style.display = "none";
  loadCategories();
  document.querySelector(".categories-section").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

loadCategories();