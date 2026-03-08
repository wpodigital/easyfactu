import { useEffect, useState } from 'react'
import { Receipt, Trash2, CheckCircle } from 'lucide-react'

export default function FacturasRecibidas() {

  const [facturas, setFacturas] = useState<any[]>([])

  const loadFacturas = async () => {
    const res = await fetch('http://localhost:3000/api/v1/facturas-recibidas')
    const data = await res.json()
    setFacturas(data)
  }

  useEffect(() => {
    loadFacturas()
  }, [])

  const marcarPagada = async (id:number) => {
    await fetch(`http://localhost:3000/api/v1/facturas-recibidas/${id}/pagar`,{
      method:'POST'
    })
    loadFacturas()
  }

  const eliminar = async (id:number) => {
    await fetch(`http://localhost:3000/api/v1/facturas-recibidas/${id}`,{
      method:'DELETE'
    })
    loadFacturas()
  }

  return (

    <div className="p-6">

      <div className="flex items-center mb-6">
        <Receipt className="w-8 h-8 mr-3 text-orange-600"/>
        <h1 className="text-3xl font-bold">
          Facturas Recibidas
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow">

        <table className="w-full">

          <thead className="border-b">

            <tr className="text-left">

              <th className="p-3">Número</th>
              <th className="p-3">Proveedor</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>

            </tr>

          </thead>

          <tbody>

            {facturas.map(f => (

              <tr key={f.id} className="border-b">

                <td className="p-3">{f.numero_factura}</td>
                <td className="p-3">{f.proveedor_nombre}</td>
                <td className="p-3">{f.fecha_factura}</td>
                <td className="p-3">{f.importe_total} €</td>

                <td className="p-3">

                  {f.estado === 'pagada'
                    ? <span className="text-green-600">Pagada</span>
                    : <span className="text-yellow-600">Pendiente</span>
                  }

                </td>

                <td className="p-3 flex gap-2">

                  {f.estado !== 'pagada' && (

                    <button
                      onClick={() => marcarPagada(f.id)}
                      className="text-green-600"
                    >
                      <CheckCircle size={18}/>
                    </button>

                  )}

                  <button
                    onClick={() => eliminar(f.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={18}/>
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )
}