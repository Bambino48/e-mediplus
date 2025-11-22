const fs = require("fs");
const path = require("path");

// Fonction pour traiter récursivement tous les fichiers JSX
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith(".jsx")) {
      processFile(filePath);
    }
  });
}

// Fonction pour traiter un fichier individuel
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Supprimer les imports de framer-motion
  content = content.replace(
    /import\s+{[^}]*motion[^}]*}\s+from\s+['"]framer-motion['"];?\s*/g,
    ""
  );

  // Remplacer motion.div par div
  content = content.replace(/motion\.div/g, "div");

  // Remplacer motion.span par span
  content = content.replace(/motion\.span/g, "span");

  // Remplacer motion.button par button
  content = content.replace(/motion\.button/g, "button");

  fs.writeFileSync(filePath, content);
}

// Traiter le dossier src
processDirectory("./src");

console.log("Traitement terminé !");
