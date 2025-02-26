import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, Alert, FlatList, TouchableOpacity,
} from "react-native";
import { addDeudaToFirestore, getDeudasFromFirestore, deleteDeudaFromFirestore } from "../credenciales";

export default function DeudasScreen() {
  const [showForm, setShowForm] = useState(false);
  const [entidad, setEntidad] = useState("");
  const [monto, setMonto] = useState("");
  const [atrasado, setAtrasado] = useState("No");
  const [cuotas, setCuotas] = useState(1);
  const [deudaPendiente, setDeudaPendiente] = useState("");
  const [deudas, setDeudas] = useState([]);

  useEffect(() => {
    fetchDeudas();
  }, []);

  const fetchDeudas = async () => {
    const data = await getDeudasFromFirestore();
    setDeudas(data);
  };

  const handleSubmit = async () => {
    if (!entidad.trim() || !monto.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Error", "El monto debe ser un número válido mayor a 0.");
      return;
    }

    if (atrasado === "Sí") {
      const deudaPendienteNum = parseFloat(deudaPendiente);
      if (!deudaPendiente.trim() || isNaN(deudaPendienteNum) || deudaPendienteNum <= 0) {
        Alert.alert("Error", "Debe ingresar un valor válido para la deuda pendiente.");
        return;
      }
    }

    const nuevaDeuda = {
      entidad,
      monto: montoNum.toFixed(2),
      atrasado,
      cuotas,
      deudaPendiente: atrasado === "Sí" ? parseFloat(deudaPendiente).toFixed(2) : null,
      fecha: new Date().toISOString(),
    };

    await addDeudaToFirestore(nuevaDeuda);
    fetchDeudas();
    handleCloseForm();

    Alert.alert("Éxito", "La deuda se ha guardado correctamente.");
  };

  const handleDeleteDeuda = async (id) => {
    try {
      await deleteDeudaFromFirestore(id);
      fetchDeudas(); // Actualiza la lista de deudas
      Alert.alert("Éxito", "La deuda se ha eliminado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar la deuda.");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEntidad("");
    setMonto("");
    setAtrasado("No");
    setCuotas(1);
    setDeudaPendiente("");
  };

  return (
    <View style={styles.container}>
      {showForm ? (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Entidad Financiera</Text>
          <TextInput style={styles.input} value={entidad} onChangeText={setEntidad} placeholderTextColor="#888" />

          <Text style={styles.label}>Monto mensual</Text>
          <TextInput style={styles.input} value={monto} onChangeText={setMonto} keyboardType="numeric" placeholderTextColor="#888" />

          <Text style={styles.label}>¿Estás atrasado en los pagos?</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity onPress={() => { setAtrasado("No"); setDeudaPendiente(""); }} style={[styles.toggleButton, atrasado === "No" ? styles.selectedYes : styles.unselected]}>
              <Text style={styles.toggleText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAtrasado("Sí")} style={[styles.toggleButton, atrasado === "Sí" ? styles.selectedNo : styles.unselected]}>
              <Text style={styles.toggleText}>Sí</Text>
            </TouchableOpacity>
          </View>

          {atrasado === "Sí" && (
            <>
              <Text style={styles.label}>Valor de la deuda pendiente</Text>
              <TextInput style={styles.input} value={deudaPendiente} onChangeText={setDeudaPendiente} keyboardType="numeric" placeholderTextColor="#888" />
            </>
          )}

          <Text style={styles.label}>Número de cuotas pendientes</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity onPress={() => setCuotas(Math.max(1, cuotas - 1))} style={styles.counterButton}>
              <Text style={styles.counterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{cuotas}</Text>
            <TouchableOpacity onPress={() => setCuotas(cuotas + 1)} style={styles.counterButton}>
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCloseForm}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.title}>Deudas Registradas</Text>
          <FlatList
            data={deudas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemText}>
                  {item.entidad}: ${parseFloat(item.monto).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={styles.itemText}>Atrasado: {item.atrasado}</Text>
                {item.atrasado === "Sí" && (
                  <Text style={styles.itemText}>
                    Deuda Pendiente: ${parseFloat(item.deudaPendiente).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                )}
                <Text style={styles.itemText}>Cuotas: {item.cuotas}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteDeuda(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* Botón flotante */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          showForm ? { display: "none" } : null, // Oculta el botón si showForm es true
        ]}
        onPress={() => setShowForm(true)}
      >
        <Text style={styles.floatingButtonText}>Agregar Deuda</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  formContainer: { backgroundColor: "#1E1E1E", padding: 20, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5 },
  label: { color: "#FFFFFF", marginBottom: 5, fontSize: 16 },
  input: { backgroundColor: "#333", color: "#FFFFFF", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },

  toggleContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  toggleButton: { flex: 1, padding: 15, alignItems: "center", marginHorizontal: 5, borderRadius: 10 },
  toggleText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  selectedYes: { backgroundColor: "#4CAF50" }, // Verde cuando es "No"
  selectedNo: { backgroundColor: "#D32F2F" }, // Rojo cuando es "Sí"
  unselected: { backgroundColor: "#444" }, // Gris cuando no está seleccionado

  counterContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 15 },
  counterButton: { backgroundColor: "#555", padding: 15, borderRadius: 10, marginHorizontal: 10 },
  counterText: { fontSize: 20, color: "#FFFFFF" },
  counterValue: { fontSize: 18, color: "#FFFFFF", marginHorizontal: 10 },

  item: { backgroundColor: "#1E1E1E", padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5 },
  itemText: { color: "#FFFFFF", fontSize: 16, marginBottom: 5 },
  deleteButton: { backgroundColor: "#D32F2F", padding: 10, borderRadius: 10, alignItems: "center", marginTop: 10 },
  deleteButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },

  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancelButton: { backgroundColor: "#D32F2F", padding: 15, borderRadius: 10, flex: 1, marginRight: 10, alignItems: "center" },
  saveButton: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, flex: 1, marginLeft: 10, alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },


  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  floatingButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});