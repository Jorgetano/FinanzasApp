import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";

const ATRASADO_OPCIONES = { NO: "No", SI: "Sí" };

const DeudaForm = ({
  entidad,
  setEntidad,
  deudaTotal,
  setDeudaTotal,
  valorCuota,
  setValorCuota,
  fechaInicio,
  setFechaInicio,
  atrasado,
  setAtrasado,
  cuotas,
  setCuotas,
  imagenEntidad,
  setSugerencias,
  sugerencias,
  handleEntidadChange,
  handleSubmit,
  handleCloseForm,
  editingDeudaId,
  entidadImagenes={entidadImagenes} // Pasa entidadImagenes como prop
}) => {
  const [cuotasPagadas, setCuotasPagadas] = useState(0);

  useEffect(() => {
    if (fechaInicio) {
      const [dia, mes, anio] = fechaInicio.split("-");
      const fechaInicioFormateada = `${anio}-${mes}-${dia}`;
      const fechaInicioDate = new Date(fechaInicioFormateada);
      const fechaActual = new Date();

      if (fechaInicioDate > fechaActual) {
        setCuotasPagadas(0); // Si la fecha de inicio es en el futuro, no hay cuotas pagadas
      } else {
        let diffMeses =
          (fechaActual.getFullYear() - fechaInicioDate.getFullYear()) * 12 +
          (fechaActual.getMonth() - fechaInicioDate.getMonth());

        if (fechaActual.getDate() < fechaInicioDate.getDate()) {
          diffMeses--; // Ajusta si el día actual es menor al día de inicio
        }

        const cuotasPagadasCalculadas = Math.max(0, diffMeses);
        setCuotasPagadas(Math.min(cuotasPagadasCalculadas, cuotas)); // Asegúrate de no exceder el número total de cuotas
      }
    }
  }, [fechaInicio, cuotas]);

  const handleSubmitDeuda = () => {
    const deuda = {
      entidad,
      deudaTotal,
      valorCuota,
      fechaInicio,
      atrasado,
      cuotas,
      cuotasPagadas,
      imagenEntidad: entidadImagenes[entidad] || null, // Asegúrate de pasar la imagen correcta
    };

    console.log("Deuda a guardar:", deuda); // Depuración
    handleSubmit(deuda);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => {
      setEntidad(item);
      setSugerencias([]);
    }}>
      <Text style={styles.sugerenciaItem}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={[{ key: "form" }]}
      renderItem={() => (
        <View style={styles.formContainer}>
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
              renderItem={renderItem}
              style={styles.sugerenciasContainer}
            />
          )}

          <Text style={styles.label}>Deuda Total</Text>
          <TextInput
            style={styles.input}
            value={deudaTotal}
            onChangeText={setDeudaTotal}
            keyboardType="numeric"
            placeholder="Ej: 10000.00"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Valor de la Cuota</Text>
          <TextInput
            style={styles.input}
            value={valorCuota}
            onChangeText={setValorCuota}
            keyboardType="numeric"
            placeholder="Ej: 500.00"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Fecha Deuda</Text>
          <TextInput
            style={styles.input}
            value={fechaInicio}
            onChangeText={setFechaInicio}
            placeholder="DD-MM-AAAA"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>¿Estás atrasado en los pagos?</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => setAtrasado(ATRASADO_OPCIONES.NO)}
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

          <Text style={styles.label}>Número de cuotas</Text>
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
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmitDeuda}>
              <Text style={styles.buttonText}>{editingDeudaId ? "Actualizar" : "Guardar"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.scrollViewContainer}
    />
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5, marginBottom: 10, marginTop: 10 },
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
  sugerenciasContainer: { backgroundColor: "#fff", borderRadius: 5, elevation: 3, marginTop: 5, maxHeight: 150, borderColor: "#ddd", borderWidth: 1 },
  sugerenciaItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd", color: "#333" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancelButton: { backgroundColor: "#E74C3C", padding: 15, borderRadius: 10, flex: 1, marginRight: 10, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  saveButton: { backgroundColor: "#2ECC71", padding: 15, borderRadius: 10, flex: 1, marginLeft: 10, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  cuotaInfo: { fontSize: 16, color: "#2C3E50", marginBottom: 15, textAlign: "center" },
});

export default DeudaForm;