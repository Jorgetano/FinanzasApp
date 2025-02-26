import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  addDeudaToFirestore,
  getDeudasFromFirestore,
  deleteDeudaFromFirestore,
} from "../credenciales";

// Constantes para opciones
const ATRASADO_OPCIONES = {
  NO: "No",
  SI: "Sí",
};

export default function DeudasScreen() {
  const [showForm, setShowForm] = useState(false);
  const [entidad, setEntidad] = useState("");
  const [monto, setMonto] = useState("");
  const [atrasado, setAtrasado] = useState(ATRASADO_OPCIONES.NO);
  const [cuotas, setCuotas] = useState(1);
  const [deudaPendiente, setDeudaPendiente] = useState("");
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar deudas al montar el componente
  useEffect(() => {
    fetchDeudas();
  }, []);

  // Obtener deudas desde Firestore
  const fetchDeudas = async () => {
    setLoading(true);
    try {
      const data = await getDeudasFromFirestore();
      setDeudas(data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las deudas. Inténtelo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Validar y guardar una nueva deuda
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

    if (cuotas <= 0) {
      Alert.alert("Error", "El número de cuotas debe ser mayor a 0.");
      return;
    }

    if (atrasado === ATRASADO_OPCIONES.SI) {
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
      deudaPendiente: atrasado === ATRASADO_OPCIONES.SI ? parseFloat(deudaPendiente).toFixed(2) : null,
      fecha: new Date().toISOString(),
    };

    try {
      await addDeudaToFirestore(nuevaDeuda);
      fetchDeudas();
      handleCloseForm();
      Alert.alert("Éxito", "La deuda se ha guardado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la deuda. Inténtelo de nuevo.");
    }
  };

  // Eliminar una deuda
  const handleDeleteDeuda = async (id) => {
    Alert.alert(
      "Eliminar Deuda",
      "¿Estás seguro de que deseas eliminar esta deuda?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await deleteDeudaFromFirestore(id);
              fetchDeudas();
              Alert.alert("Éxito", "La deuda se ha eliminado correctamente.");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la deuda.");
            }
          },
        },
      ]
    );
  };

  // Cerrar el formulario y resetear los campos
  const handleCloseForm = () => {
    setShowForm(false);
    setEntidad("");
    setMonto("");
    setAtrasado(ATRASADO_OPCIONES.NO);
    setCuotas(1);
    setDeudaPendiente("");
  };

  // Renderizar cada elemento de la lista de deudas
  const renderItem = useCallback(({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        {item.entidad}: ${parseFloat(item.monto).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
      <Text style={styles.itemText}>Atrasado: {item.atrasado}</Text>
      {item.atrasado === ATRASADO_OPCIONES.SI && (
        <Text style={styles.itemText}>
          Deuda Pendiente: ${parseFloat(item.deudaPendiente).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      )}
      <Text style={styles.itemText}>Cuotas: {item.cuotas}</Text>
      <TouchableOpacity
        accessibilityLabel="Eliminar deuda"
        accessibilityHint="Elimina la deuda seleccionada"
        style={styles.deleteButton}
        onPress={() => handleDeleteDeuda(item.id)}
      >
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      {showForm ? (
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.label}>Entidad Financiera</Text>
          <TextInput
            style={styles.input}
            value={entidad}
            onChangeText={setEntidad}
            placeholder="Ej: Banco XYZ"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Monto mensual</Text>
          <TextInput
            style={styles.input}
            value={monto}
            onChangeText={setMonto}
            keyboardType="numeric"
            placeholder="Ej: 1500.00"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>¿Estás atrasado en los pagos?</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => {
                setAtrasado(ATRASADO_OPCIONES.NO);
                setDeudaPendiente("");
              }}
              style={[
                styles.toggleButton,
                atrasado === ATRASADO_OPCIONES.NO ? styles.selectedYes : styles.unselected,
              ]}
            >
              <Text style={styles.toggleText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAtrasado(ATRASADO_OPCIONES.SI)}
              style={[
                styles.toggleButton,
                atrasado === ATRASADO_OPCIONES.SI ? styles.selectedNo : styles.unselected,
              ]}
            >
              <Text style={styles.toggleText}>Sí</Text>
            </TouchableOpacity>
          </View>

          {atrasado === ATRASADO_OPCIONES.SI && (
            <>
              <Text style={styles.label}>Valor de la deuda pendiente</Text>
              <TextInput
                style={styles.input}
                value={deudaPendiente}
                onChangeText={setDeudaPendiente}
                keyboardType="numeric"
                placeholder="Ej: 500.00"
                placeholderTextColor="#888"
              />
            </>
          )}

          <Text style={styles.label}>Número de cuotas pendientes</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              onPress={() => setCuotas(Math.max(1, cuotas - 1))}
              style={styles.counterButton}
            >
              <Text style={styles.counterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{cuotas}</Text>
            <TouchableOpacity
              onPress={() => setCuotas(cuotas + 1)}
              style={styles.counterButton}
            >
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
        </ScrollView>
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.title}>Deudas Registradas</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <FlatList
              data={deudas}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          )}
        </View>
      )}

      {/* Botón flotante para agregar deuda */}
      {!showForm && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.floatingButtonText}>Agregar Deuda</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  
  container: { flex: 1, padding: 20, backgroundColor: "#00527c" },

  //Deuda Registrada\\
  title: { 
    color: "#00000", 
    fontSize: 30, 
    fontWeight: "normal", 
    marginBottom: 20, 
    textAlign: "center", 
    fontFamily: "Dancing Script, cursive", // Fuente cursiva
    letterSpacing: 1, 
    textShadow: "3px 3px 4px black" // Sombra suave
  }
  
  ,
  formContainer: { backgroundColor: "#0000", padding: 20, borderRadius: 15 },
  label: { color: "#FFFFFF", marginBottom: 5, fontSize: 16 },
  input: { backgroundColor: "#333", color: "#FFFFFF", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  toggleContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  toggleButton: { flex: 1, padding: 15, alignItems: "center", marginHorizontal: 5, borderRadius: 10 },
  toggleText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  selectedYes: { backgroundColor: "#4CAF50" }, // Verde para "No"
  selectedNo: { backgroundColor: "#D32F2F" }, // Rojo para "Sí"
  unselected: { backgroundColor: "#444" }, // Gris para no seleccionado
  counterContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  counterButton: { backgroundColor: "#555", padding: 15, borderRadius: 10, marginHorizontal: 10 },
  counterText: { fontSize: 20, color: "#FFFFFF" },
  counterValue: { fontSize: 18, color: "#FFFFFF", marginHorizontal: 10 },
  item: { backgroundColor: "#003f5d", padding: 15, borderRadius: 10, marginBottom: 10 },
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
    
  },
  floatingButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});