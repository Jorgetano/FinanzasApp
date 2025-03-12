import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";

const RegistrarPagoModal = ({ visible, onClose, deuda, onRegistrarPago }) => {
  const [montoPago, setMontoPago] = useState("");
  const [opcionPago, setOpcionPago] = useState("cuota"); // "cuota" o "otro"

  const handleRegistrarPago = async () => {
    let monto = 0;
  
    if (opcionPago === "cuota") {
      monto = parseFloat(deuda.valorCuota);
  
      if (isNaN(monto) || monto <= 0) {
        Alert.alert("Error", "El valor de la cuota no es válido.");
        return;
      }
    } else {
      if (!montoPago || montoPago.trim() === "") {
        Alert.alert("Error", "Ingrese un monto válido.");
        return;
      }
  
      monto = parseFloat(montoPago.replace(",", "."));
  
      if (isNaN(monto) || monto <= 0) {
        Alert.alert("Error", "Ingrese un monto válido.");
        return;
      }
    }
  
    const nuevaDeudaPendiente = parseFloat(deuda.deudaPendiente) - monto;
  
    if (nuevaDeudaPendiente <= 0) {
      // Si la deuda pendiente es 0 o menor, mover la deuda a "DeudasPagadas"
      onRegistrarPago(deuda.id, monto, true); // Pasar `true` para indicar que la deuda está pagada
    } else {
      // Si la deuda pendiente no es 0, solo actualizar la deuda
      onRegistrarPago(deuda.id, monto, false); // Pasar `false` para indicar que la deuda no está pagada
    }
  
    // Cerrar el modal y limpiar el campo de monto
    setMontoPago("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Registrar Pago</Text>

          <View style={styles.opcionesPago}>
            <TouchableOpacity
              style={[
                styles.opcionPagoButton,
                opcionPago === "cuota" && styles.opcionPagoButtonSelected,
              ]}
              onPress={() => setOpcionPago("cuota")}
            >
              <Text style={styles.opcionPagoText}>Pagar Cuota</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.opcionPagoButton,
                opcionPago === "otro" && styles.opcionPagoButtonSelected,
              ]}
              onPress={() => setOpcionPago("otro")}
            >
              <Text style={styles.opcionPagoText}>Otro Valor</Text>
            </TouchableOpacity>
          </View>

          {opcionPago === "otro" && (
            <TextInput
              placeholder="Ingrese el monto"
              keyboardType="numeric"
              value={montoPago}
              onChangeText={(text) => {
                const cleanedText = text.replace(/[^0-9.]/g, "");
                setMontoPago(cleanedText);
              }}
              style={styles.input}
            />
          )}

          <View style={styles.modalButtons}>
            <Button title="Cancelar" color="#E74C3C" onPress={onClose} />
            <Button title="Registrar" color="#2ECC71" onPress={handleRegistrarPago} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  opcionesPago: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  opcionPagoButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#CCC",
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  opcionPagoButtonSelected: {
    backgroundColor: "#3498DB",
    borderColor: "#3498DB",
  },
  opcionPagoText: {
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default RegistrarPagoModal;