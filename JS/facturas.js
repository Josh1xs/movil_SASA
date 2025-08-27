document.addEventListener("DOMContentLoaded", async () => {
  const cont = document.getElementById("facturasContainer");
  const userId = localStorage.getItem("userId"); // Cliente

  if(!userId){ cont.innerHTML = "<p class='text-center text-muted'>Inicia sesión.</p>"; return; }

  try{
    // Endpoint que trae facturas del cliente por join (o pásalo por query en backend)
    const facturas = await fetch(`/api/facturas?cliente=${encodeURIComponent(userId)}`).then(r=>r.json());

    // Carga pagos y agrupa por idFactura (si tu endpoint de facturas ya trae pagado/saldo, omite esto)
    const pagos = await fetch(`/api/pagos?cliente=${encodeURIComponent(userId)}`).then(r=>r.json());
    const pagadoPorFactura = pagos.reduce((acc,p)=>{
      acc[p.idFactura] = (acc[p.idFactura] || 0) + Number(p.monto || 0);
      return acc;
    }, {});

    if(!facturas.length){ cont.innerHTML = "<p class='text-center text-muted'>No hay facturas.</p>"; return; }

    cont.innerHTML = facturas.map(f => {
      const pagado = pagadoPorFactura[f.idFactura] || 0;
      const saldo  = (Number(f.montoTotal)||0) - pagado;
      const estado = saldo > 0 ? "Pendiente" : "Pagada";
      return `
        <div class="card">
          <h5 class="text-danger mb-1">Factura #${f.idFactura}</h5>
          <p><strong>Fecha:</strong> ${new Date(f.fecha).toLocaleDateString()}</p>
          <p><strong>Total:</strong> $${Number(f.montoTotal).toFixed(2)}</p>
          <p><strong>Estado:</strong> ${estado}</p>
          <a class="btn primary btn-detail" href="../Facturas/factura-detalle.html?id=${f.idFactura}">Ver detalles</a>
        </div>
      `;
    }).join("");

  }catch{
    cont.innerHTML = "<p class='text-danger text-center'>Error al cargar facturas.</p>";
  }
});
