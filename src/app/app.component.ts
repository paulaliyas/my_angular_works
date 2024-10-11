import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Corrected to styleUrls
})
export class AppComponent implements OnInit {
  title = 'my-bootstrap-app';
  @Input() cardNumber: string = 'XXXX XXXX XXXX 3774';
  @Input() expiryDate: string = '12/25';
  @Input() cardholderName: string = 'Abdul Rehman';
  @Input() status: string = 'Active';
  @Input() isActive: boolean = true;
  checkoutId: string = 'CCA7DDA4B8DFCF82CDE020462F8C771D.uat01-vm-tx03';
  shopperResultUrl: string = 'http://localhost:4200/';

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    // this.pay();
  }

  pay() {
    this.loadExternalScriptAndForm();
  }

  private loadExternalScriptAndForm(): void {
    const locale = 'en';
    const storePaymentDetailsLabel = 'Save Card Details for Future Use ';
    const scriptUrl = `https://api-test.hyperpay.com/v1/paymentWidgets.js?checkoutId=${this.checkoutId}`;
    const additionalScriptContent = `
      var wpwlOptions = {
        style: "plain",
        locale: "${locale}",
        forceCardHolderEqualsBillingName: false,
        registrations: {requireCvv: true},
        brandDetection: true,
        applePay: {
          displayName: "GOSI",
          total: { label: "GOSI" },
          supportedNetworks: ["mada"],
          supportedCountries: ["SA"],
          version: 3,
          countryCode: "SA"
        },
        onReady: function() {
          $(".wpwl-group-cardNumber").after($(".wpwl-group-brand").detach());
          $(".wpwl-group-cvv").after($(".wpwl-group-cardHolder").detach());
          var visa = $(".wpwl-brand:first").clone().removeAttr("class").attr("class", "wpwl-brand-card wpwl-brand-custom wpwl-brand-VISA");
          var master = $(visa).clone().removeClass("wpwl-brand-VISA").addClass("wpwl-brand-MASTER");
          $(".wpwl-brand:first").after($(master)).after(visa);
          var imageUrl = "https://eu-test.oppwa.com/v1/static/" + wpwl.cacheVersion + "/img/brand.png";
          $(".wpwl-brand-custom").css("background-image", "url(" + imageUrl + ")");
          var createRegistrationHtml = '<div class="customLabel">${storePaymentDetailsLabel}</div><div class="customInput"><input type="checkbox" name="createRegistration" value="true" /></div>';
          $('form.wpwl-form-card').find('.wpwl-button').before(createRegistrationHtml);
        },
        onChangeBrand: function(e) {
          $(".wpwl-brand-custom").css("opacity", "0.3");
          $(".wpwl-brand-" + e).css("opacity", "1");
        }
      }
    `;

    // CSS to inject
    const cssContent = `div.wpwl-wrapper,
div.wpwl-label,
div.wpwl-sup-wrapper {
  width: 100%;
  border-radius: 10px; /* Border radius for wpwl elements */
  overflow: hidden; /* Ensures children do not overflow the border radius */
}

div.wpwl-group-expiry,
div.wpwl-group-brand {
  width: 50%;
  float: left;
  font-size: 1.13rem;
}

div.wpwl-group-cvv {
  width: 48%;
  float: left;
  margin-left: 2%;
  font-size: 1.13rem;
}

div.wpwl-group-cardHolder,
div.wpwl-sup-wrapper-street1,
div.wpwl-group-expiry {
  clear: both;
}

div.wpwl-sup-wrapper-street1 {
  padding-top: 1px;
}

div.wpwl-wrapper-brand,
div.wpwl-label-brand,
div.wpwl-brand {
  display: none;
}

div.wpwl-group-cardNumber {
  width: 100%;
  float: left;
  font-size: 1.13rem;
}

div.wpwl-group-brand {
  width: 35%;
  display: none;
  float: left;
  margin-top: 28px;
}

div.wpwl-brand-card {
  width: 65px;
}

div.wpwl-brand-custom {
  margin: 0px 5px;
}

div.wpwl-group-cardHolder {
  width: 100%;
  font-size: 1.13rem;
}

form.wpwl-form {
  margin: 0 !important;
}

.wpwl-form {
  max-width: 50% !important;
}

@media (max-width: 768px) {
  .wpwl-form {
    max-width: 100% !important;
  }
}

.wpwl-apple-pay-button {
  font-size: 16px !important;
  display: block !important;
  width: 20% !important;
  -webkit-appearance: -apple-pay-button;
  -apple-pay-button-type: buy;
}`;

    // Load the CSS dynamically
    const style = this.renderer.createElement('style');
    style.type = 'text/css';
    style.textContent = cssContent;
    this.renderer.appendChild(this.document.head, style);

    // Load paymentWidgets.js dynamically
    const script = this.renderer.createElement('script');
    script.src = scriptUrl;
    script.onload = () => {
      console.log('Main script loaded successfully');

      this.renderer.appendChild(
        this.document.body,
        this.renderer.createElement('div')
      );

      // Load additional script content
      const additionalScript = this.renderer.createElement('script');
      additionalScript.type = 'text/javascript';
      additionalScript.text = additionalScriptContent;
      this.renderer.appendChild(this.document.body, additionalScript);
    };
    script.onerror = (error: any) =>
      console.error('Main script load error:', error);
    this.renderer.appendChild(this.document.body, script);
  }
}
