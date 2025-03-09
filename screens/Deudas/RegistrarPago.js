import React, { useState } from "react";
import { View, Text, Modal, TextInput, Button, StyleSheet, Alert } from "react-native";

const RegistrarPagoModal = ({ visible, onClose, deuda, onRegistrarPago }) => {
  const [montoPago, setMontoPago] = useState("");

  const handleRegistrarPago = () => {
    const nuevoPago = parseFloat(montoPago);
    if (isNaN(nuevoPago) || nuevoPago <= 0) {
      Alert.alert("Error", "Ingrese un monto válido.");
      return;
    }

    let cuotasPagadas = deuda.cuotasPagadas || 0;
    let deudaTotal = parseFloat(deuda.deudaTotal);
    let valorCuota = parseFloat(deuda.valorCuota);
    let pagosRealizados = parseFloat(deuda.pagosRealizados || 0);
    let cuotasPendientes = deuda.cuotas - cuotasPagadas;

    // Si hay cuotas pendientes, el pago se aplica primero a la cuota pendiente
    if (cuotasPendientes > 0) {
      let montoRestante = nuevoPago;

      // Aplicar el pago a la cuota pendiente
      if (montoRestante >= valorCuota) {
        cuotasPagadas += 1;
        pagosRealizados += valorCuota;
        montoRestante -= valorCuota;
      } else {
        pagosRealizados += montoRestante;
        montoRestante = 0;
      }

      // Si aún hay monto restante, se aplica a la deuda total
      if (montoRestante > 0) {
        deudaTotal -= montoRestante;
        pagosRealizados += montoRestante;
      }
    } else {
      // Si no hay cuotas pendientes, el pago se aplica directamente a la deuda total
      deudaTotal -= nuevoPago;
      pagosRealizados += nuevoPago;
    }

    // Llamar a la función onRegistrarPago para actualizar la deuda en Firestore
    onRegistrarPago(deuda.id, {
      cuotasPagadas,
      deudaTotal,
      pagosRealizados,
    });

    // Cerrar el modal y limpiar el campo de monto
    setMontoPago("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Registrar Pago</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el monto"
            keyboardType="numeric"
            value={montoPago}
            onChangeText={setMontoPago}
          />
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