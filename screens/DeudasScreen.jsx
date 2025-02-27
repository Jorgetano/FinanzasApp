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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:"25",
    paddingLeft: "15",
    paddingBottom: "2",
    paddingRight: "15",
    backgroundColor: "#F5F5F5", // Fondo claro
    justifyContent: "flex-start"
  },

  title: {
    color: "#2C3E50", // Color oscuro
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Roboto",
  },

  formContainer: {
    backgroundColor: "#FFFFFF", // Fondo blanco para el formulario
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: "10",
    marginTop: "10"
  },
  listContainer: {
    flex: 1,
    marginTop: -7, // Add space above the list container
  },

  label: {
    color: "#34495E", // Color de texto más oscuro
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "500",
  },

  input: {
    backgroundColor: "#ECF0F1", // Fondo de entrada más claro
    color: "#2C3E50",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#BDC3C7",
  },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BDC3C7",
    backgroundColor: "#FFFFFF", // Fondo blanco
  },

  toggleText: {
    color: "#2C3E50",
    fontSize: 16,
    fontWeight: "600",
  },

  selectedYes: {
    backgroundColor: "#2ECC71", // Verde para seleccionado
    borderColor: "#27AE60",
  },
  selectedNo: {
    backgroundColor: "#E74C3C", // Rojo para seleccionado
    borderColor: "#C0392B",
  },
  unselected: {
    backgroundColor: "#FFFFFF", // Fondo blanco para no seleccionado
  },

  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  counterButton: {
    backgroundColor: "#3498DB", // Azul para los botones de contador
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  counterText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  counterValue: {
    fontSize: 18,
    color: "#2C3E50",
    marginHorizontal: 10,
  },

  item: {
    backgroundColor: "#FFFFFF", // Fondo blanco para las deudas
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 10,
    borderLeftColor: "#3498DB", // Color azul para la barra lateral
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  deleteButton: {
    backgroundColor: "#E74C3C", // Rojo para eliminar
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  cancelButton: {
    backgroundColor: "#E74C3C", // Rojo para cancelar
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },

  saveButton: {
    backgroundColor: "#2ECC71", // Verde para guardar
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#3498DB", // Azul para el botón flotante
    padding: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },

  floatingButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  title: {
    color: "#2C3E50", // Color oscuro
    fontSize: 20, // Aumentar el tamaño de la fuente
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
    fontFamily: "Roboto",
    textTransform: "uppercase", // Hacer el texto en mayúsculas
    margin:"-10",
  },
});