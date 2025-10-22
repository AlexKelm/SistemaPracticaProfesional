const express = require("express");
const router = express.Router();
const tecnicoModel = require("../models/tecnicoModel");

// GET todos los técnicos
router.get("/", async (req, res) => {
  try {
    const tecnicos = await tecnicoModel.getAll();
    res.json(tecnicos);
  } catch (err) {
    console.error("Error al obtener técnicos:", err);
    res.status(500).json({ error: "Error al obtener técnicos" });
  }
});

// GET técnico por ID
router.get("/:id", async (req, res) => {
  try {
    const tecnico = await tecnicoModel.getById(req.params.id);
    if (!tecnico) return res.status(404).json({ error: "Técnico no encontrado" });
    res.json(tecnico);
  } catch (err) {
    console.error("Error al obtener técnico:", err);
    res.status(500).json({ error: "Error al obtener técnico" });
  }
});

// Crear técnico
router.post("/", async (req, res) => {
  try {
    await tecnicoModel.create(req.body);
    res.json({ message: "Técnico creado correctamente" });
  } catch (err) {
    console.error("Error al crear técnico:", err);
    if (err.message === "Nombre, apellido, usuario y contraseña son obligatorios" || 
        err.message === "El usuario ya existe") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al crear técnico" });
  }
});

// Actualizar técnico
router.put("/:id", async (req, res) => {
  try {
    const result = await tecnicoModel.update(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Técnico no encontrado" });
    }
    res.json({ message: "Técnico actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar técnico:", err);
    if (err.message === "El usuario ya existe") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al actualizar técnico" });
  }
});

// Eliminar técnico (marcar como inactivo)
router.delete("/:id", async (req, res) => {
  try {
    const result = await tecnicoModel.remove(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Técnico no encontrado" });
    }
    res.json({ message: "Técnico eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar técnico:", err);
    res.status(500).json({ error: "Error al eliminar técnico" });
  }
});

// Obtener órdenes asignadas a un técnico
router.get("/:id/ordenes", async (req, res) => {
  try {
    const ordenes = await tecnicoModel.getOrdenesAsignadas(req.params.id);
    res.json(ordenes);
  } catch (err) {
    console.error("Error al obtener órdenes del técnico:", err);
    res.status(500).json({ error: "Error al obtener órdenes del técnico" });
  }
});

// Asignar técnico a una orden
router.post("/:id/asignar-orden", async (req, res) => {
  try {
    const { ordenId } = req.body;
    if (!ordenId) {
      return res.status(400).json({ error: "ID de orden es requerido" });
    }
    
    const result = await tecnicoModel.asignarOrden(ordenId, req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json({ message: "Técnico asignado correctamente" });
  } catch (err) {
    console.error("Error al asignar técnico:", err);
    if (err.message === "Técnico no encontrado") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al asignar técnico" });
  }
});

module.exports = router;
