import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  addDeudaToFirestore,
  getDeudasFromFirestore,
  deleteDeudaFromFirestore,
  updateDeudaInFirestore,
} from "../../credenciales";
import DeudaForm from "./DeudaForm";
import DeudaList from "./DeudaList";

const ATRASADO_OPCIONES = { NO: "No", SI: "Sí" };

// Mapa de entidades a imágene
const entidadImagenes = {
  "Bancolombia": require('../../assets/Bancolombia-.png'),
  "Agaval": require('../../assets/Agaval.webp'),
  "Banco de Bogota": require('../../assets/Banco De Bogota.png'),
};

const entidadesFinancieras = ["Bancolombia", "Agaval", "Banco de Bogota", "Davivienda", "Banco de Occidente", "Banco Popular", "Banco Agrario de Colombia", "BBVA Colombia", "Banco AV Villas", "Banco Caja Social", "Banco GNB Sudameris", "Scotiabank Colpatria", "Banco Pichincha", "Bancoomeva", "Banco W", "Banco Finandina", "Banco Falabella", "Bancamía", "Banco Credifinanciera", "Banco Coopcentral"];

export default function DeudasScreen() {
  const [showForm, setShowForm] = useState(false);
  const [entidad, setEntidad] = useState("");
  const [deudaTotal, setDeudaTotal] = useState("");
  const [valorCuota, setValorCuota] = useState("");
  const [pagosRealizados, setPagosRealizados] = useState(0);
  const [atrasado, setAtrasado] = useState(ATRASADO_OPCIONES.NO);
  const [cuotas, setCuotas] = useState(1);
  const [fechaInicio, setFechaInicio] = useState("");
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagenEntidad, setImagenEntidad] = useState(null);
  const [editingDeudaId, setEditingDeudaId] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    fetchDeudas();
  }, []);

  const fetchDeudas = async () => {
    setLoading(true);
    try {
      const data = await getDeudasFromFirestore();
      const deudasConImagenes = data.map((deuda) => ({
        ...deuda,
        imagen: entidadImagenes[deuda.entidad] || null, // Mapea la imagen
      }));
      setDeudas(deudasConImagenes);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las deudas. Inténtelo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (deuda) => {
    try {
      if (editingDeudaId) {
        await updateDeudaInFirestore(editingDeudaId, deuda);
        Alert.alert("Éxito", "La deuda se ha actualizado correctamente.");
      } else {
        await addDeudaToFirestore(deuda);
        Alert.alert("Éxito", "La deuda se ha guardado correctamente.");
      }

      await fetchDeudas(); // Refrescar la lista de deudas
      handleCloseForm(); // Restablecer el formulario y cerrar
      setShowForm(false); // Asegurar que vuelve a la lista de deudas
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la deuda. Inténtelo de nuevo.");
    }
  };

  const handleDeleteDeuda = async (id) => {
    try {
      await deleteDeudaFromFirestore(id);
      fetchDeudas(); // Recargar la lista de deudas después de eliminar
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar la deuda.");
    }
  };

  const handleEditDeuda = (deuda) => {
    setEditingDeudaId(deuda.id);
    setEntidad(deuda.entidad);
    setDeudaTotal(deuda.deudaTotal);
    setValorCuota(deuda.valorCuota);
    setPagosRealizados(deuda.pagosRealizados);
    setAtrasado(deuda.atrasado);
    setCuotas(deuda.cuotas);
    setFechaInicio(deuda.fechaInicio);
    setImagenEntidad(deuda.imagen || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEntidad("");
    setDeudaTotal("");
    setValorCuota("");
    setPagosRealizados(0);
    setAtrasado(ATRASADO_OPCIONES.NO);
    setCuotas(1);
    setFechaInicio("");
    setImagenEntidad(null);
    setEditingDeudaId(null);
  };

  const handleEntidadChange = (texto) => {
    setEntidad(texto);
    if (texto.length > 0) {
      const sugerenciasFiltradas = entidadesFinancieras.filter((entidad) =>
        entidad.toLowerCase().includes(texto.toLowerCase())
      );
      setSugerencias(sugerenciasFiltradas);
  
      // Actualizar la imagen de la entidad si existe
      const imagen = entidadImagenes[texto];
      if (imagen) {
        setImagenEntidad(imagen);
      } else {
        setImagenEntidad(null);
      }
    } else {
      setSugerencias([]);
      setImagenEntidad(null);
    }
  };

  const calcularDeudaPendiente = (deudaTotal, pagosRealizados) => {
    return parseFloat(deudaTotal) - parseFloat(pagosRealizados);
  };

  const mostrarDetallesDeuda = (deuda) => {
    const deudaPendiente = calcularDeudaPendiente(deuda.deudaTotal, deuda.pagosRealizados);
    const cuotasPendientes = deuda.cuotas - deuda.cuotasPagadas;

    Alert.alert(
      "Detalles de la Deuda",
      `                           📌 ${deuda.entidad}\n\n💰 Deuda Total: $${deuda.deudaTotal}\n📆 Fecha Inicio: ${deuda.fechaInicio}\n💳 Cuotas Pendientes: ${cuotasPendientes}\n💲 Valor Cuota: $${deuda.valorCuota}\n🔹 Deuda Pendiente: $${deudaPendiente}`,
      [{ text: "Cerrar", style: "cancel" }]
    );
  };

  const handleRegistrarPago = async (id, monto) => {
    try {
      const deuda = deudas.find((d) => d.id === id);
      if (!deuda) {
        Alert.alert("Error", "No se encontró la deuda.");
        return;
      }

      const nuevoPago = parseFloat(monto);
      if (isNaN(nuevoPago)) {
        Alert.alert("Error", "El monto ingresado no es válido.");
        return;
      }

      const pagosActualizados = parseFloat(deuda.pagosRealizados) + nuevoPago;
      await updateDeudaInFirestore(id, { pagosRealizados: pagosActualizados });

      Alert.alert("Éxito", "El pago se ha registrado correctamente.");
      fetchDeudas(); // Actualizar la lista de deudas
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar el pago.");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {showForm ? (
          <DeudaForm
            entidad={entidad}
            setEntidad={setEntidad}
            deudaTotal={deudaTotal}
            setDeudaTotal={setDeudaTotal}
            valorCuota={valorCuota}
            setValorCuota={setValorCuota}
            fechaInicio={fechaInicio}
            setFechaInicio={setFechaInicio}
            atrasado={atrasado}
            setAtrasado={setAtrasado}
            cuotas={cuotas}
            setCuotas={setCuotas}
            pagosRealizados={pagosRealizados}
            setPagosRealizados={setPagosRealizados}
            imagenEntidad={imagenEntidad}
            sugerencias={sugerencias}
            setSugerencias={setSugerencias}
            handleEntidadChange={handleEntidadChange}
            handleSubmit={handleSubmit}
            handleCloseForm={handleCloseForm}
            editingDeudaId={editingDeudaId}
            entidadImagenes={entidadImagenes}
          />
        ) : (
          <DeudaList
            deudas={deudas}
            loading={loading}
            handleDeleteDeuda={handleDeleteDeuda}
            handleEditDeuda={handleEditDeuda}
            mostrarDetallesDeuda={mostrarDetallesDeuda}
            handleRegistrarPago={handleRegistrarPago}
          />
        )}

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
  container: { flex: 1, padding: 15, backgroundColor: "#F5F5F5" },
  floatingButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#3498DB", padding: 15, borderRadius: 30, elevation: 5 },
  floatingButtonText: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  container: { flex: 1, padding: 15, backgroundColor: "#F5F5F5" },
  floatingButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#3498DB", padding: 15, borderRadius: 30, elevation: 5 },
  floatingButtonText: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
});

