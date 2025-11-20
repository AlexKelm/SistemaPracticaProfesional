const express = require("express");
const router = express.Router();
const ordenModel = require("../models/ordenModel");

// Obtener todas las órdenes
router.get("/", async (req, res) => {
  try {
    const ordenes = await ordenModel.getAll();
    res.json(ordenes);
  } catch (err) {
    console.error("❌ Error al obtener órdenes:", err);
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
});

// Crear orden
router.post("/", async (req, res) => {
  try {
    console.log("📝 Datos recibidos para crear orden:", req.body);
    await ordenModel.create(req.body);
    res.json({ message: "Orden creada correctamente" });
  } catch (err) {
    console.error("❌ Error al crear orden:", err);
    console.error("❌ Datos enviados:", req.body);
    
    // Mejor manejo de errores de FK
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      if (err.message.includes('fk_orden_cliente')) {
        return res.status(400).json({ 
          error: "El cliente seleccionado no existe",
          cliente_id_recibido: req.body.cliente_id 
        });
      }
      if (err.message.includes('fk_orden_tecnico')) {
        return res.status(400).json({ error: "El técnico seleccionado no existe" });
      }
      return res.status(400).json({ error: "Error de integridad referencial en la base de datos" });
    }
    
    res.status(500).json({ error: err.message || "Error al crear orden" });
  }
});

// Actualizar orden
router.put("/:id", async (req, res) => {
  try {
    const result = await ordenModel.update(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json({ message: "Orden actualizada correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar orden:", err);
    res.status(500).json({ error: "Error al actualizar orden" });
  }
});

// Eliminar orden
router.delete("/:id", async (req, res) => {
  try {
    const result = await ordenModel.remove(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json({ message: "Orden eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar orden:", err);
    res.status(500).json({ error: "Error al eliminar orden" });
  }
});

// Endpoint para agenda: obtener órdenes con fecha de servicio
router.get("/agenda", async (req, res) => {
  try {
    const ordenes = await ordenModel.getAll();
    const ordenesAgenda = ordenes.filter(o => o.fecha_servicio);
    res.json(ordenesAgenda);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener órdenes para agenda" });
  }
});

// Obtener orden por ID (se debe colocar al final para no conflictuar con /agenda)
router.get("/:id", async (req, res) => {
  try {
    const orden = await ordenModel.getById(req.params.id);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
    res.json(orden);
  } catch (err) {
    console.error("❌ Error al obtener orden:", err);
    res.status(500).json({ error: "Error al obtener orden" });
  }
});

module.exports = router;
