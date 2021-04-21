let data
let error
const cart = { 
   
}

function addToCart(productId) {
    const count = cart[productId]
    if (count) {
        cart[productId] = count + 1
    } else {
        cart[productId] = 1
    }
    render()
}

function removeFromCart(productId) {
    const count = cart[productId] 
    if (count) {
        if (count > 1) {
            cart[productId] = count -1
        } else {
           delete cart[productId]
        }
    }
    render()
}

function createPlaceholderElement() {
    const div = document.createElement('div')
    div.className = 'placeholder'

    div.innerHTML = `
        <div class="loader">Loading...</div>
    `
    return div
}

function createProductElement(product) {
    const { imgSrc, name, raiting, price, id } = product
   

    const div = document.createElement('div')
    div.className = 'product'
    div.innerHTML = `
    <div class="product_image"><img src="${imgSrc}" alt="${name}"></div>
    <div class="rating rating_${raiting}" data-rating="${raiting}">
        <i class="fa fa-star"></i>
        <i class="fa fa-star"></i>
        <i class="fa fa-star"></i>
        <i class="fa fa-star"></i>
        <i class="fa fa-star"></i>
    </div>
    <div class="product_content clearfix">
        <div class="product_info">
            <div class="product_name"><a href="product.html?id=${id}">${name}</a></div>
            <div class="product_price">$${price}</div>
        </div>
        <div class="product_options">
        <div class="product_fav product_option" onclick="removeFromCart('${id}')">-</div>
            <div class="product_buy product_option"><img src="images/shopping-bag-white.svg" alt=""></div>
            <div class="product_fav product_option" onclick="addToCart('${id}')">+</div>
        </div>
    </div>
`

    const count = cart[id]

    if (count) {
        const productBuyElement = div.querySelector('.product_buy')
        const countElement = document.createElement('div')
        countElement.className = 'product-count'
        countElement.innerHTML = count
        productBuyElement.appendChild(countElement)

    }

    return div
}

function createCartItemElement(product, quantity) {
    const { imgSrc, name, id, price } = product

    const total = price * quantity

    const li = document.createElement('li')
    li.className = 'cart_product d-flex flex-md-row flex-column align-items-md-center align-items-start justify-content-start'

    li.innerHTML = `
        <!-- Product Image -->
        <div class="cart_product_image"><img src="${imgSrc}" alt="${name}"></div>
        <!-- Product Name -->
        <div class="cart_product_name"><a href="product.html?id=${id}">${name}</a></div>
        <div class="cart_product_info ml-auto">
            <div class="cart_product_info_inner d-flex flex-row align-items-center justify-content-md-end justify-content-start">
                <!-- Product Price -->
                <div class="cart_product_price">$${price}</div>
                <!-- Product Quantity -->
                <div class="product_quantity_container">
                    <div class="product_quantity clearfix">
                        <input id="quantity_input" type="text" pattern="[0-9]*" value="${quantity}">
                        <div class="quantity_buttons">
                            <div id="quantity_inc_button" class="quantity_inc quantity_control"><i class="fa fa-caret-up" aria-hidden="true"></i></div>
                            <div id="quantity_dec_button" class="quantity_dec quantity_control"><i class="fa fa-caret-down" aria-hidden="true"></i></div>
                        </div>
                    </div>
                </div>
                <!-- Products Total Price -->
                <div class="cart_product_total">$${total}</div>
                <!-- Product Cart Trash Button -->
                <div class="cart_product_button">
                    <button class="cart_product_remove"><img src="images/trash.png" alt=""></button>
                </div>
            </div>
        </div>
    `

    return li
}

function render() {
    //Products
    const root = document.getElementById('root')
    root.innerHTML = ''

    if (data && !error) {
        for (const product of data) {
            const div = createProductElement(product)
            root.appendChild(div)
        }
    } else if (!data && !error) {
        for (let index = 0; index < 6; index++) {
            const placeholderElement = createPlaceholderElement()
            root.appendChild(placeholderElement)
        }
    } else {
        root.append(error)
    }
    
    const cartProductIds = Object.keys(cart)
    //Cart number

    const cartNumElement = document.querySelector('.cart_num')
    cartNumElement.innerHTML = cartProductIds.length

    //Cart items
    const cartProductsRoot = document.getElementById('cart_products_root')
    cartProductsRoot.innerHTML = ''

    let subtotal = 0

    for (const productId of cartProductIds) {

        const product = data.find(p => p.id === productId)
        const quantity = cart[productId]

        const cartItemElement = createCartItemElement(product, quantity)
        cartProductsRoot.appendChild(cartItemElement)

        subtotal = subtotal + product.price * quantity
    }

    // Cart total
    const shipping = 5
    document.getElementById('cart_subtotal').innerHTML = `$${subtotal}`
    document.getElementById('cart_shipping').innerHTML = `$${shipping}`
    document.getElementById('cart_total').innerHTML = `$${subtotal + shipping}`
}

function toggleCartModal(event) {
    event.preventDefault()

    document
        .querySelector('.cart_overlay')
        .classList
        .toggle('cart_overlay_closed')
}

function mapProducts(data) {
    const { values: rows } = data 

    const headerKeys = rows.shift()

    const products = rows.map(row => {
        const product = {}

        /**@todo use reduce */
        row.forEach((cell, cellIndex) => {
            const key = headerKeys[cellIndex]
            product[key] = cell
        })

        return product
    })

    return products
}

function loadProducts() {
    const sheetId = '1JGCeNOBdqlBYoMR7safnCJnbIUq3H8a7qc6woZDexgo'
    const apiKey = 'AIzaSyANND39tkb0USt5_laUskHGSs7Ri7eb1aw'

    render()

    fetch(
       `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`
    )
    .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }

        return response
    })    
    .then(response => response.json())
    .then(responseData => {
        data = mapProducts(responseData)
        
    })

    .catch(responseError => {
        error = responseError
    })

    .finally(() => {
        render()
    })

   document
    .getElementById('cart_link')
    .addEventListener('click', toggleCartModal)

   document 
    .getElementById('cart_close_area')
    .addEventListener('click', toggleCartModal)
}

window.addEventListener('load', loadProducts)