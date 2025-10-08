const express = require("express");
const router = express.Router();
const clienteModel = require("../models/clienteModel");

// GET todos los clientes
router.get("/", async (req, res) => {
  try {
    const clientes = await clienteModel.getAll();
    res.json(clientes);
  } catch (err) {
    console.error("❌ Error al obtener clientes:", err);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// GET cliente por ID
router.get("/:id", async (req, res) => {
  try {
    const cliente = await clienteModel.getById(req.params.id);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (err) {
    console.error("❌ Error al obtener cliente:", err);
    res.status(500).json({ error: "Error al obtener cliente" });
  }
});

// Crear cliente
router.post("/", async (req, res) => {
  try {
    await clienteModel.create(req.body);
    res.json({ message: "Cliente creado correctamente" });
  } catch (err) {
    console.error("❌ Error al crear cliente:", err);
    if (err.message === "Razón social y CUIT son obligatorios") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al crear cliente" });
  }
});

// Actualizar cliente
router.put("/:id", async (req, res) => {
  try {
    const result = await clienteModel.update(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json({ message: "Cliente actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar cliente:", err);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

//  Eliminar cliente
router.delete("/:id", async (req, res) => {
  try {
    const result = await clienteModel.remove(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar cliente:", err);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
});

module.exports = router;
