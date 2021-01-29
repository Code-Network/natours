// Hide the alert
export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// TODO: Show alert
// type is 'success' or 'error'
export const showAlert = (type, msg) => {
  // todo: Step 1: Before we show an alert, first hide any alert that exists.
  hideAlert();

  /*	todo: Step 2: Create HTML markup and link to style.css appropriate class
		   .alert {
				   position: fixed;
				   top: 0;
				   left: 50%;
				   -webkit-transform: translateX(-50%);
				   transform: translateX(-50%);
				   z-index: 9999;
				   color: #fff;
				   font-size: 1.8rem;
				   font-weight: 400;
				   text-align: center;
				   border-bottom-left-radius: 5px;
				   border-bottom-right-radius: 5px;
				   padding: 1.6rem 15rem;
				   -webkit-box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.25);
				   box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.25);
		   }
				.alert--success {
				    background-color: #20bf6b;
				 }
				 .alert--error {
				    background-color: #eb4d4b;
				 }
  */

  /*
	 todo: Step 3: Create div.alert.alert--success or div.alert.alert--error
	    element as the first element after the body begins
	 */
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  // todo:  Step 4:  Hide alert after five seconds
  window.setTimeout(hideAlert, 5000);
};
