const mongoose = require('mongoose');
const { Schema } = mongoose;

const CierreDeCajaSchema = new Schema({
    // Información de la estación
    estacionDeCobro: {
        type: Schema.Types.ObjectId,
        ref: 'EstacionDeCobro',
        required: true
    },
    ubicacionDeEstacion: {
        type: String,
        required: true
    },

    // Usuario que realizó el cierre
    usuarioQueCierra: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    nombreDelUsuario: {
        type: String,
        required: true
    },

    // Fecha y período
    fechaDeApertura: {
        type: Date,
        required: true
    },
    fechaDeCierre: {
        type: Date,
        required: true
    },
    periodo: {
        type: String,
        enum: ['DIARIO', 'SEMANAL', 'MENSUAL'],
        default: 'DIARIO'
    },

    // Dinero inicial y final
    dineroDeInicio: {
        type: Number,
        required: true
    },
    dineroEnCaja: {
        type: Number,
        required: true
    },

    // Ventas en efectivo
    ventasEnEfectivo: {
        cantidad: {
            type: Number,
            default: 0
        },
        montoTotal: {
            type: Number,
            default: 0
        }
    },

    // Ventas en otro medio
    ventasEnOtro: {
        cantidad: {
            type: Number,
            default: 0
        },
        montoTotal: {
            type: Number,
            default: 0
        }
    },

    // Ingresos manuales
    ingresosManualDinero: {
        cantidad: {
            type: Number,
            default: 0
        },
        montoTotal: {
            type: Number,
            default: 0
        }
    },

    // Egresos manuales
    egresosManualDinero: {
        cantidad: {
            type: Number,
            default: 0
        },
        montoTotal: {
            type: Number,
            default: 0
        }
    },

    // Cálculos
    dineroEsperado: {
        type: Number,
        required: true
    },
    dineroReal: {
        type: Number,
        required: true
    },
    diferencia: {
        type: Number,
        default: 0
    },
    estado: {
        type: String,
        enum: ['ABIERTO', 'CERRADO', 'CONCILIADO'],
        default: 'ABIERTO'
    },

    // Notas
    notasDelCierre: {
        type: String,
        default: ''
    },

    // Detalles de ventas
    detallesDeVentas: [
        {
            ventaId: Schema.Types.ObjectId,
            monto: Number,
            tipoPago: String,
            fecha: Date
        }
    ],

    // Ingresos/Egresos manual detallado
    detallesIngresosEgresos: [
        {
            tipo: {
                type: String,
                enum: ['INGRESO', 'EGRESO']
            },
            monto: Number,
            concepto: String,
            fecha: Date,
            comentario: String
        }
    ]
}, {
    timestamps: true
});

// Índices para búsquedas rápidas
CierreDeCajaSchema.index({ estacionDeCobro: 1, fechaDeCierre: -1 });
CierreDeCajaSchema.index({ periodo: 1, fechaDeCierre: -1 });
CierreDeCajaSchema.index({ usuarioQueCierra: 1 });

module.exports = mongoose.model('CierreDeCaja', CierreDeCajaSchema);
