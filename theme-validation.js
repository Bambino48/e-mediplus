// Theme System Validation Script
// Run this in the browser console to test theme functionality

console.log("🔍 Testing Theme System...");

// Test 1: Check if ThemeProvider is working
const themeProvider = document.querySelector("[data-theme-provider]");
if (themeProvider) {
  console.log("✅ ThemeProvider is mounted");
} else {
  console.log("❌ ThemeProvider not found");
}

// Test 2: Check initial theme state
const initialTheme = localStorage.getItem("theme") || "light";
console.log(`📋 Initial theme from localStorage: ${initialTheme}`);

// Test 3: Check if dark class is applied correctly
const hasDarkClass = document.documentElement.classList.contains("dark");
console.log(`🌙 Dark class applied: ${hasDarkClass}`);

// Test 4: Check if theme toggle button exists
const themeButton = document.querySelector(
  'button[aria-label*="theme"], button[class*="theme"]'
);
if (themeButton) {
  console.log("✅ Theme toggle button found");

  // Test 5: Simulate theme toggle
  console.log("🔄 Simulating theme toggle...");
  themeButton.click();

  setTimeout(() => {
    const newHasDarkClass = document.documentElement.classList.contains("dark");
    const newTheme = localStorage.getItem("theme");
    console.log(`📋 New theme in localStorage: ${newTheme}`);
    console.log(`🌙 Dark class after toggle: ${newHasDarkClass}`);

    if (newTheme !== initialTheme) {
      console.log("✅ Theme toggle working correctly");
    } else {
      console.log("❌ Theme toggle not working");
    }

    // Test 6: Check if Tailwind dark classes are working
    const testElement = document.createElement("div");
    testElement.className =
      "bg-white dark:bg-slate-900 text-black dark:text-white";
    testElement.textContent = "Test";
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const backgroundColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;

    console.log(`🎨 Background color: ${backgroundColor}`);
    console.log(`🎨 Text color: ${textColor}`);

    if (
      backgroundColor !== "rgba(0, 0, 0, 0)" &&
      textColor !== "rgb(0, 0, 0)"
    ) {
      console.log("✅ Tailwind dark classes working");
    } else {
      console.log("❌ Tailwind dark classes not working");
    }

    document.body.removeChild(testElement);

    console.log("🎉 Theme system validation complete!");
  }, 100);
} else {
  console.log("❌ Theme toggle button not found");
}
