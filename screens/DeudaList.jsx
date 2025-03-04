import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, Modal, TextInput, Button, Platform } from "react-native";
import { Swipeable } from 'react-native-gesture-handler';

const DeudaList = ({
  deudas,
  loading,
  handleDeleteDeuda,
  handleEditDeuda,
  handleRegistrarPago,
  mostrarDetallesDeuda,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [montoPago, setMontoPago] = useState("");
  const [selectedDeudaId, setSelectedDeudaId] = useState(null);

  const handleOpenModal = (id) => {
    setSelectedDeudaId(id);
    setModalVisible(true);
  };

  const handleConfirmPago = () => {
    if (!montoPago.trim()) {
      Alert.alert("Error", "Debe ingresar un monto válido.");
      return;
    }
    handleRegistrarPago(selectedDeudaId, montoPago);
    setMontoPago("");
    setModalVisible(false);
  };

  const renderItem = useCallback(({ item }) => {
    const renderRightActions = () => (
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteDeuda(item.id)}>
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    );

    const renderLeftActions = () => (
      <View style={styles.leftActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditDeuda(item)}>
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <Swipeable renderRightActions={renderRightActions} renderLeftActions={renderLeftActions}>
        <TouchableOpacity onPress={() => mostrarDetallesDeuda(item)}>
          <View style={styles.itemContainer}>
            <Text style={styles.itemText2}> {item.fechaInicio}</Text>
            <View style={[styles.item, { borderLeftColor: item.atrasado === "Sí" ? "#E74C3C" : "#3498DB" }]}>
              {item.imagen && <Image source={item.imagen} style={styles.entityImage} resizeMode="contain" />}
              <View style={styles.itemContent}>
                <Text style={styles.itemText}>
                  <Text style={styles.itemTextLabel}>Valor Cuota: </Text>
                  <Text style={styles.itemTextValue}>${parseFloat(item.valorCuota).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </Text>
                <Text style={styles.itemText}>
                  <Text style={styles.itemTextLabel}>Cuota: </Text>
                  <Text style={styles.itemTextValue}>{item.cuotasPagadas + 1} de {item.cuotas}</Text>
                </Text>
                <TouchableOpacity style={styles.pagoButton} onPress={() => handleOpenModal(item.id)}>
                  <Text style={styles.pagoButtonText}>Registrar Pago</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }, []);

  return (
    <View style={styles.listContainer}>
      <Text style={styles.title}>Deudas Registradas</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList data={deudas} keyExtractor={(item) => item.id} renderItem={renderItem} />
      )}

      {/* Modal para registrar pago */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
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
              <Button title="Cancelar" color="#E74C3C" onPress={() => setModalVisible(false)} />
              <Button title="Registrar" color="#2ECC71" onPress={handleConfirmPago} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: { flex: 1, marginTop: -7 },
  itemContainer: { marginBottom: 10 },
  item: { backgroundColor: "#FFFFFF", padding: 15, borderRadius: 10, flexDirection: "row", alignItems: "center", borderLeftWidth: 15, borderLeftColor: "#3498DB", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  entityImage: { width: 50, height: 50, marginRight: 15, borderRadius: 5 },
  itemContent: { flex: 1 },
  itemText: { fontSize: 14, color: "#2C3E50", marginBottom: 5 },
  itemTextLabel: { fontSize: 14, color: "#34495E" },
  itemTextValue: { fontSize: 14, color: "#2C3E50", fontWeight: "bold" },
  itemText2: { position: "relative", marginLeft: "33%", fontSize: 16, color: "#2C3E50", flex: 1, left: 16, top: 10, transform: [{ translateY: -5 }], zIndex: 1, width: 90, borderWidth: 1, borderColor: "#ffff", borderRadius: 5, backgroundColor: "#ffff", shadowColor: "#000", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  rightActions: { justifyContent: "center", alignItems: "flex-end", marginRight: 15 },
  leftActions: { justifyContent: "center", alignItems: "flex-start", marginLeft: 15 },
  deleteButton: { backgroundColor: "#E74C3C", borderRadius: 5, width: 82, height: 82, top: 8, justifyContent: "center", alignItems: "center" },
  deleteButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  editButton: { backgroundColor: "#3498DB", borderRadius: 5, width: 82, height: 82, top: 8, justifyContent: "center", alignItems: "center" },
  editButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  pagoButton: { backgroundColor: "#2ECC71", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 10 },
  pagoButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: "#2C3E50" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { width: "100%", borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
});

export default DeudaList;
