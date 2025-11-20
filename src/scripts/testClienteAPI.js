const clienteModel = require("../models/clienteModel");

async function testClienteAPI() {
  try {
    console.log("\n=== Probando clienteModel.getAll() ===");
    const clientes = await clienteModel.getAll();
    console.log("\nClientes retornados:");
    console.log(JSON.stringify(clientes, null, 2));
    
    if (clientes.length > 0) {
      console.log("\n📋 Primer cliente:");
      console.log("Keys:", Object.keys(clientes[0]));
      console.log("id?", clientes[0].id);
      console.log("id_cliente?", clientes[0].id_cliente);
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

testClienteAPI();
