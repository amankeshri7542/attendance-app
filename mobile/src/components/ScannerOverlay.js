import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

const ScannerOverlay = () => {
    return (
        <View style={styles.container}>
            <View style={styles.overlayTop} />
            <View style={styles.row}>
                <View style={styles.overlaySide} />
                <View style={styles.scannerFrame}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                    <View style={styles.scanLine} />
                </View>
                <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    row: {
        flexDirection: 'row',
        height: SCANNER_SIZE,
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    scannerFrame: {
        width: SCANNER_SIZE,
        height: SCANNER_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderColor: '#1a227f',
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderTopLeftRadius: 16,
    },
    topRight: {
        top: 0,
        right: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopRightRadius: 16,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomLeftRadius: 16,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomRightRadius: 16,
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: '#1a227f',
        top: '50%',
        shadowColor: '#1a227f',
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
});

export default ScannerOverlay;
