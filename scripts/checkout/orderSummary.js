import { cart, removeFromCart, updateDeliveryOption, updateQuantity } from '../../data/cart.js'
import { deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';
import { getProduct} from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js'
import { renderPaymentSummary } from './paymentSummary.js';

export function updateHeader(){
    let quantity = 0;
    cart.forEach(item => {
        quantity+=item.quantity;
    })
    document.querySelector('.return-to-home-link').innerText=`${quantity} items`;
}

export function renderOrderSumary() {
    let cartSummaryHTML='';

    cart.forEach(cartItem => {
        const {productId} = cartItem;

        const matchingProduct = getProduct(productId);

        const deliveryOptionId = cartItem.deliveryOptionId;

        const deliveryOption = getDeliveryOption(deliveryOptionId);

        const today = dayjs();
        const deliveryDate = today.add(deliveryOption.deliveryDay,'days');
        const dateString = deliveryDate.format('dddd, MMMM D');

        cartSummaryHTML += `
            <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
                <div class="delivery-date">
                    Delivery date: ${dateString}
                </div>

                <div class="cart-item-details-grid">
                    <img class="product-image"
                    src="${matchingProduct.image}">

                    <div class="cart-item-details">
                        <div class="product-name">
                            ${matchingProduct.name}
                        </div>
                        <div class="product-price">
                            $${formatCurrency(matchingProduct.priceCents)}
                        </div>
                        <div class="product-quantity">
                            <span>
                            Quantity: <span class="quantity-label">${cartItem.quantity}</span>
                            </span>
                            <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
                            Update
                            </span>
                            <input class="quantity-input js-quantity-input-${matchingProduct.id}">
                            <span class="save-link link-primary js-save-link" data-product-id="${matchingProduct.id}">
                            Save
                            </span>
                            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                            Delete
                            </span>
                        </div>
                    </div>

                    <div class="delivery-options">
                        <div class="delivery-options-title">
                            Choose a delivery option:
                        </div>
                        ${deliveryOptionsHTML(matchingProduct,cartItem)}
                    </div>
                </div>
            </div>
        `;
    });

    function deliveryOptionsHTML(matchingProduct,cartItem) {
        let deliveryHTML = '';
        deliveryOptions.forEach(option => {
            const today = dayjs();
            const deliveryDate = today.add(option.deliveryDay,'days');
            const dateString = deliveryDate.format('dddd, MMMM D');
            const priceString = option.priceCents === 0 ? 'FREE' : `$${formatCurrency(option.priceCents)}`;

            const isChecked = option.id === cartItem.deliveryOptionId

            deliveryHTML += `
                <div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}" data-delivery-option-id="${option.id}">
                    <input type="radio" ${isChecked ? 'checked' : ''} class="delivery-option-input"
                    name="delivery-option-${matchingProduct.id}">
                    <div>
                        <div class="delivery-option-date">
                            ${dateString}
                        </div>
                        <div class="delivery-option-price">
                            ${priceString} Shipping
                        </div>
                    </div>
                </div>
            `
        });

        return deliveryHTML;
    }

    document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

    document.querySelectorAll('.js-delete-link').forEach(link => {
        link.addEventListener('click',() => {
            const productId=link.dataset.productId;
            removeFromCart(productId);

            const container = document.querySelector(`
                .js-cart-item-container-${productId}
            `);

            container.remove();

            renderPaymentSummary();
            updateHeader();
        })
    });

    document.querySelectorAll('.js-update-link').forEach(link => {
        link.addEventListener('click',() => {
            const productId=link.dataset.productId;

            document.querySelector(`.js-cart-item-container-${productId}`).classList.add('is-editing-quantity');
        });
    });

    function saveQuantity(link){
        const productId=link.dataset.productId;

        const quantityInput=document.querySelector(`.js-quantity-input-${productId}`);

        const value=Number(quantityInput.value);

        if(value >= 1 && value < 100){
            updateQuantity(productId, value);
        }
        else{
            alert("Enter quantity between 1 and 99");
            return;
        }

        document.querySelector(`.js-cart-item-container-${productId}`).classList.remove('is-editing-quantity');

        renderOrderSumary();
        renderPaymentSummary();
        updateHeader();
    }

    document.querySelectorAll('.js-save-link').forEach(link => {
        link.addEventListener('click',() => {
            saveQuantity(link)
        });
        link.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                saveQuantity(link);
            }
        });
    });

    document.querySelectorAll('.js-delivery-option').forEach(element => {
        element.addEventListener('click', () => {
            const {productId, deliveryOptionId} = element.dataset;
            updateDeliveryOption(productId,deliveryOptionId)
            renderOrderSumary();
            renderPaymentSummary();
        });
    });
}