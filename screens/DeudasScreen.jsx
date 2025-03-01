import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, TextInput, Alert, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Image
} from "react-native";
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { addDeudaToFirestore, getDeudasFromFirestore, deleteDeudaFromFirestore, updateDeudaInFirestore } from "../credenciales";

// Constantes para opciones
const ATRASADO_OPCIONES = { NO: "No", SI: "Sí" };

// Mapa de entidades a imágenes
const entidadImagenes = {
  "Bancolombia": require('../assets/Bancolombia-.png'),
  "Agaval": require('../assets/Agaval.webp'),
  "Banco De Bogota": require('../assets/Banco De Bogota.png'),

};

const entidadesFinancieras = [
  "Bancolombia",
  "Banco de Bogotá",
  "Davivienda",
  "Banco de Occidente",
  "Banco Popular",
  "Banco Agrario de Colombia",
  "BBVA Colombia",
  "Banco AV Villas",
  "Banco Caja Social",
  "Banco GNB Sudameris",
  "Scotiabank Colpatria",
  "Banco Pichincha",
  "Bancoomeva",
  "Banco W",
  "Banco Finandina",
  "Banco Falabella",
  "Bancamía",
  "Banco Credifinanciera",
  "Banco Coopcentral",
];

export default function DeudasScreen() {
  const [showForm, setShowForm] = useState(false);
  const [entidad, setEntidad] = useState("");
  const [monto, setMonto] = useState("");
  const [atrasado, setAtrasado] = useState(ATRASADO_OPCIONES.NO);
  const [cuotas, setCuotas] = useState(1);
  const [deudaPendiente, setDeudaPendiente] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagenEntidad, setImagenEntidad] = useState(null);
  const [editingDeudaId, setEditingDeudaId] = useState(null); // Estado para almacenar el ID de la deuda en edición
  const [sugerencias, setSugerencias] = useState([]);

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

  // Validar y guardar una nueva deuda o actualizar una existente
  const handleSubmit = async () => {
    if (!entidad.trim() || !monto.trim() || !fechaInicio.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    const montoNum = Number(monto.replace(/,/g, '.'));
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Error", "El monto debe ser un número válido.");
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
      fechaInicio,
      imagen: entidadImagenes[entidad] || null,
    };

    try {
      if (editingDeudaId) {
        // Si hay un ID de edición, actualiza la deuda
        await updateDeudaInFirestore(editingDeudaId, nuevaDeuda);
        Alert.alert("Éxito", "La deuda se ha actualizado correctamente.");
      } else {
        // Si no hay ID de edición, crea una nueva deuda
        await addDeudaToFirestore(nuevaDeuda);
        Alert.alert("Éxito", "La deuda se ha guardado correctamente.");
      }
      fetchDeudas();
      handleCloseForm();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la deuda. Inténtelo de nuevo.");
    }
  };

  // Eliminar una deuda
  const handleDeleteDeuda = async (id) => {
    try {
      await deleteDeudaFromFirestore(id);
      fetchDeudas();
      Alert.alert("Éxito", "La deuda se ha eliminado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar la deuda.");
    }
  };

  // Editar una deuda
  const handleEditDeuda = (deuda) => {
    setEditingDeudaId(deuda.id); // Guarda el ID de la deuda en edición
    setEntidad(deuda.entidad);
    setMonto(deuda.monto);
    setAtrasado(deuda.atrasado);
    setCuotas(deuda.cuotas);
    setDeudaPendiente(deuda.deudaPendiente || "");
    setFechaInicio(deuda.fechaInicio);
    setImagenEntidad(deuda.imagen || null);
    setShowForm(true); // Muestra el formulario
  };

  // Cerrar el formulario y resetear los campos
  const handleCloseForm = () => {
    setShowForm(false);
    setEntidad("");
    setMonto("");
    setAtrasado(ATRASADO_OPCIONES.NO);
    setCuotas(1);
    setDeudaPendiente("");
    setFechaInicio("");
    setImagenEntidad(null);
    setEditingDeudaId(null); // Limpia el ID de edición
  };

  // Manejar el cambio de entidad
  const handleEntidadChange = (texto) => {
    setEntidad(texto);
    if (texto.length > 0) {
      const sugerenciasFiltradas = entidadesFinancieras.filter((entidad) =>
        entidad.toLowerCase().includes(texto.toLowerCase())
      );
      setSugerencias(sugerenciasFiltradas);
    } else {
      setSugerencias([]);
    }
  };

  // Renderizar cada elemento de la lista de deudas
  const renderItem = useCallback(({ item }) => {
    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteDeuda(item.id)}
      >
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    );

    const renderLeftActions = () => (
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditDeuda(item)}
      >
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
      >
        <Text style={styles.itemText2}> {item.fechaInicio}</Text>

        <View style={[styles.item, { borderLeftColor: item.atrasado === ATRASADO_OPCIONES.SI ? "#E74C3C" : "#3498DB" }]}>
          {item.imagen && (
            <Image
              source={item.imagen}
              style={{ width: 50, height: 50, marginBottom: 10, marginRight: "15" }}
              resizeMode="contain" // Ajusta la imagen sin cortarla
            />
          )}
          <Text style={styles.itemText}>
            ${parseFloat(item.monto).toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>

          {item.atrasado === ATRASADO_OPCIONES.SI && (
            <Text style={styles.itemText}>
              Atrasada: ${parseFloat(item.deudaPendiente).toLocaleString("es-ES", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          )}
          <Text style={styles.itemText}>Cuotas: {item.cuotas}</Text>

        </View>
      </Swipeable>
    );
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {showForm ? (
          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.label}>Entidad Financiera</Text>
            <TextInput
              style={styles.input}
              value={entidad}
              onChangeText={handleEntidadChange}
              placeholder="Ej: Banco XYZ"
              placeholderTextColor="#888"
            />
            {sugerencias.length > 0 && (
              <FlatList
                data={sugerencias}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => {
                    setEntidad(item);
                    setSugerencias([]);
                  }}>
                    <Text style={styles.sugerenciaItem}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={styles.sugerenciasContainer}
              />
            )}

            {imagenEntidad && (
              <Image
                source={imagenEntidad}
                style={{ width: 100, height: 100, alignSelf: 'center', marginBottom: 20 }}
                resizeMode="contain" // Ajusta la imagen sin cortarla
              />
            )}

            <Text style={styles.label}>Monto mensual</Text>
            <TextInput
              style={styles.input}
              value={monto}
              onChangeText={setMonto}
              keyboardType="numeric"
              placeholder="Ej: 1500.00"
              placeholderTextColor="#888"
            />
            <Text style={styles.label}>Fecha Deuda</Text>
            <TextInput style={styles.input} value={fechaInicio} onChangeText={setFechaInicio} keyboardType="numeric"
              placeholder="DD-MM-AAAA" placeholderTextColor="#888" />

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
                <Text style={styles.buttonText}>{editingDeudaId ? "Actualizar" : "Guardar"}</Text>
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1, padding: "15", backgroundColor: "#F5F5F5",
  },// Fondo claro
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: "#2C3E50" },
  formContainer: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5, marginBottom: 10, marginTop: 10 },
  listContainer: { flex: 1, marginTop: -7 },
  label: { color: "#34495E", marginBottom: 5, fontSize: 16, fontWeight: "500" },
  input: { backgroundColor: "#ECF0F1", color: "#2C3E50", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: "#BDC3C7" },
  toggleContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  toggleButton: { flex: 1, padding: 12, alignItems: "center", marginHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: "#BDC3C7", backgroundColor: "#FFFFFF" },
  toggleText: { color: "#2C3E50", fontSize: 16, fontWeight: "600" },
  selectedYes: { backgroundColor: "#2ECC71", borderColor: "#27AE60" },
  selectedNo: { backgroundColor: "#E74C3C", borderColor: "#C0392B" },
  unselected: { backgroundColor: "#FFFFFF" },
  counterContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  counterButton: { backgroundColor: "#3498DB", padding: 12, borderRadius: 8, marginHorizontal: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 3 },
  counterText: { fontSize: 20, color: "#FFFFFF", fontWeight: "600" },
  counterValue: { fontSize: 18, color: "#2C3E50", marginHorizontal: 10 },

  item: { backgroundColor: "#FFFFFF", padding: 12, borderRadius: 10, marginTop: "-9", flexDirection: "row", alignItems: "center", borderLeftWidth: 15, borderLeftColor: "#3498DB", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  entityImage: { width: 40, height: 40, padding: "5", borderRadius: 5 },
  itemText: { fontSize: 14, color: "#2C3E50", flex: 1 }, //letras del contenedor

  itemText2: {
    position: "relative",
    marginLeft: "33%",
    fontSize: 16,
    color: "#2C3E50",
    flex: 1,
    left: 16,
    top: 10,
    transform: [{ translateY: -5 }],
    zIndex: 1,
    width: 90,
    borderWidth: 1,
    borderColor: "#ffff",
    borderRadius: 5,
    backgroundColor: "#ffff",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },

  sugerenciasContainer: {
  backgroundColor: "#fff",
  borderRadius: 5,
  elevation: 3,
  marginTop: 5,
  maxHeight: 150,
  borderColor: "#ddd",
  borderWidth: 1,
},
sugerenciaItem: {
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#ddd",
  color: "#333",
},

  deleteButton: { backgroundColor: "#E74C3C", borderRadius: 5, width: "180", height: "80", marginTop: "20", alignItems: "center", justifyContent: "center" },
  deleteButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold", paddingEnd: "2" },

  editButton: { backgroundColor: "#3498DB", borderRadius: 5, width: "180", height: "80", marginTop: "20", alignItems: "center", justifyContent: "center" },
  editButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold", paddingEnd: "2" },

  floatingButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#3498DB", padding: 15, borderRadius: 30, elevation: 5 },
  floatingButtonText: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },

  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancelButton: { backgroundColor: "#E74C3C", padding: 15, borderRadius: 10, flex: 1, marginRight: 10, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  saveButton: { backgroundColor: "#2ECC71", padding: 15, borderRadius: 10, flex: 1, marginLeft: 10, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  floatingDateContainer: { position: "absolute", top: 20, left: "50%", transform: [{ translateX: -100 }], backgroundColor: "#2C3E50", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, zIndex: 10 },
  floatingDateText: { color: "#2C3E50", fontSize: 14, fontWeight: "bold" },
});