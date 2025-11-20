const tecnicoModel = require("../models/tecnicoModel");

async function testTecnicoAPI() {
  try {
    console.log("\n=== Probando tecnicoModel.getAll() ===");
    const tecnicos = await tecnicoModel.getAll();
    console.log("\nTécnicos retornados:");
    console.log(JSON.stringify(tecnicos, null, 2));
    
    if (tecnicos.length > 0) {
      console.log("\n📋 Primer técnico:");
      console.log("Keys:", Object.keys(tecnicos[0]));
      console.log("id?", tecnicos[0].id);
      console.log("id_tecnico?", tecnicos[0].id_tecnico);
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

testTecnicoAPI();
