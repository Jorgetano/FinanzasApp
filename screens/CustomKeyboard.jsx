import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomKeyboard = ({ onKeyPress, onCancel, onAdd, onToday, onPlus, onMinus, onCheck, onClear }) => {
  const keys = [
    ['7', '8', '9', 'Hoy'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '-'],
    ['.', '0', '☒', '✓']
  ];

  const handlePress = (key) => {
    switch (key) {
      case 'Hoy':
        onToday();
        break;
      case '+':
        onPlus();
        break;
      case '-':
        onMinus();
        break;
      case '✓':
        onCheck();
        break;
      case '☒':
        onClear();
        break;
      default:
        onKeyPress(key);
    }
  };

  return (
    <View style={styles.keyboard}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handlePress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onCancel}>
          <Text style={styles.actionButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onAdd}>
          <Text style={styles.actionButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  key: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    width: '22%',
    alignItems: 'center',
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  keyText: {
    fontSize: 20,
    color: '#6200ee',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomKeyboard;