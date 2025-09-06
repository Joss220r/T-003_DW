
document.addEventListener('click', e => {
    if (e.target.closest('.agregar-carrito')) {
    const badge = document.getElementById('cart-count');
    badge.textContent = (parseInt(badge.textContent) || 0) + 1;
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const API = "https://backcvbgtmdesa.azurewebsites.net/api/productos";
    const contCats = document.getElementById('contenedor-categorias');
    const contProd = document.getElementById('contenedor-productos');
    const baseUrl  = location.origin + location.pathname;

    const catIdOf   = p => p.CategoriaId ?? p.categoriaId ?? p.IdCategoria ?? p.idCategoria ?? null;
    const catNameOf = p => p?.Categoria?.Nombre ?? p?.CategoriaNombre ?? p?.Categoria ?? ("Categoría " + (catIdOf(p) ?? ""));

    contProd.innerHTML = '<div class="col-12"><div class="alert alert-info">Cargando...</div></div>';

    try {
    const res = await fetch(API);
    if (!res.ok) throw new Error();
    const productos = await res.json();

    const sel = new URLSearchParams(location.search).get('codCat') ? Number(new URLSearchParams(location.search).get('codCat')) : null;

    const mapa = new Map();
    productos.forEach(p => { const id = catIdOf(p); if (id != null && !mapa.has(id)) mapa.set(id, catNameOf(p)); });

    let html = `<li><button type="button" class="categoria w-100 py-3 mb-3 ${sel==null?'active':''}" data-id="">Todos</button></li>`;
    for (const [id, nombre] of mapa.entries()) {
        html += `<li><button type="button" class="categoria w-100 py-3 mb-3 ${sel===Number(id)?'active':''}" data-id="${id}">${nombre}</button></li>`;
    }
    contCats.innerHTML = html;

    const render = (catId) => {
        const lista = catId==null ? productos : productos.filter(p => Number(catIdOf(p)) === catId);
        contProd.innerHTML = lista.map(p => {
        const enOferta = p.EnOferta && p.PrecioOferta != null;
        const precio = enOferta
            ? `<span class="text-danger">$${parseFloat(p.PrecioOferta).toFixed(2)}</span>
                <small class="text-muted text-decoration-line-through ms-1">$${parseFloat(p.Precio).toFixed(2)}</small>`
            : `$${parseFloat(p.Precio).toFixed(2)}`;
        return `
            <div class="col-sm-12 col-md-4 mb-4">
            <div class="card h-100">
                <img src="${p.Imagen}" class="card-img-top img-fluid" alt="${p.Nombre||'Producto'}">
                <div class="card-body d-flex flex-column">
                <h6 class="card-title">${p.Nombre||''}</h6>
                <p class="card-text small mb-2">${p.Descripcion||''}</p>
                <p class="fw-bold mb-3">${precio}</p>
                <button class="btn btn-primary mt-auto agregar-carrito">Agregar al carrito</button>
                </div>
            </div>
            </div>`;
        }).join('');
    };
    render(sel);

    contCats.addEventListener('click', e => {
        const btn = e.target.closest('button.categoria');
        if (!btn) return;
        const id = btn.dataset.id ? Number(btn.dataset.id) : null;
        window.location.href = id==null ? baseUrl : `${baseUrl}?codCat=${id}`;
    });

    const btnBorrar = document.getElementById('btn-borrar-filtro');
    if (btnBorrar) btnBorrar.addEventListener('click', () => window.location.href = baseUrl);

    } catch {
    contProd.innerHTML = '<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los productos.</div></div>';
    contCats.innerHTML = `<li><button class="categoria w-100 py-3 mb-3" disabled>Categorías no disponibles</button></li>`;
    }
});
