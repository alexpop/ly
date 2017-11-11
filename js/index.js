var SignupForm = Vue.component('signup-form', {
  // TEMPLATE
  template: '#signup-form',

  // DATA
  data() {
    return {
      fullname: 'John Doe',
      fullname_msg: '',
      fulladdr: 'Rainmaking Loft, London, E1W 1UN',
      fulladdr_msg: '',
      loanamount: '1000',
      loanamount_msg: '',
      disable_btn: true
    }
  },

  // WATCH
  watch: {
    fullname: function(value) {
      this.valid_fullname(value, 'fullname_msg');
    },
    fulladdr: function(value) {
      this.valid_fulladdr(value, 'fulladdr_msg');
    }
  },

  // METHODS
  methods: {
    valid_fullname(value, msg) {
      if (/^.+ +.+$/.test(value)) {
        this[msg] = '';
        this.disable_btn = false;
        return true;
      } else {
        this[msg] = 'Keep typing...waiting for a valid name';
        this.disable_btn = true;
        return false;
      }
    },
    valid_fulladdr(value, msg) {
      if (/^.{4,}$/.test(value)) {
        this[msg] = '';
        this.disable_btn = false;
        return true;
      } else {
        this[msg] = 'Keep typing...waiting for a valid address';
        this.disable_btn = true;
        return false;
      }
    },
    on_signup() {
      window.localStorage.setItem("fullname", this.fullname);
      window.localStorage.setItem("firstname", this.fullname.split(" ")[0]);
      this.fullname = '';
      this.fullname_msg = '';
      this.disable_btn = true;
      this.$emit('change_comp', 'results');
    },
    show_terms() {
      this.$emit('change_comp', 'terms');
    }
  }
});

var Results = Vue.component('results', {
  // TEMPLATE
  template: '#results',

  // DATA
  data() {
    apiKey = window.localStorage.getItem("API_KEY");
    data = {
      punter: window.localStorage.getItem("firstname"),
      complete: false,
      paperwork: true
    }

    if (apiKey == null) {
      alert("Please store your API_KEY in the browser's Local Storage and try again!");
      return data
    }

    // Using the ES5 fetch for API calls to the backend
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Authorization', 'API-Key '+apiKey);
    fetch("https://play.railsbank.com/v1/customer/endusers", {
      method : "POST", headers: myHeaders,
      body : JSON.stringify({"person":{"name":"Javascript user"}})
    }).then(function(response) {
      var contentType = response.headers.get("content-type");
      if(contentType && contentType.includes("application/json")) { return response.json(); }
      throw new TypeError("Oops, we haven't got JSON!");
    }).then(function(json) {
      console.log("Successfully created user "+json.enduser_id);
      window.localStorage.setItem("enduser_id", json.enduser_id);
      fetch("https://play.railsbank.com/v1/customer/endusers/"+json.enduser_id+"/wait", {
        method : "GET", headers: myHeaders
      }).then(function(response) { return response.json();
      }).then(function(json) {
        console.log("User "+json.ledger_id+" is now in an OK state");
        gbpLedgerRequest = {
          "holder_id": json.enduser_id,
          "partner_product": "ExampleBank-GBP-1",
          "asset_class": "currency",
          "asset_type": "gbp",
          "ledger_type": "ledger-type-single-user",
          "ledger_who_owns_assets": "ledger-assets-owned-by-me",
          "ledger_primary_use_types": ["ledger-primary-use-types-payments"],
          "ledger_t_and_cs_country_of_jurisdiction": "GB"
        }
        fetch("https://play.railsbank.com/v1/customer/ledgers", {
          method : "POST", headers: myHeaders, mode: 'cors',
          body : JSON.stringify(gbpLedgerRequest)
        }).then(function(response) { return response.json();
        }).then(function(json) {
          console.log("Successfully created ledger with id="+json.ledger_id);
          window.localStorage.setItem("ledger_id", json.ledger_id);
          fetch("https://play.railsbank.com/v1/customer/ledgers/"+json.ledger_id+"/wait", {
            method : "GET", headers: myHeaders
          }).then(function(response) { return response.json();
          }).then(function(json) {
            console.log("Ledger "+json.ledger_id+" is now in an OK state w/ sort code: "+json.uk_sort_code+" and account number "+json.uk_account_number);
            window.localStorage.setItem("uk_sort_code", json.uk_sort_code);
            window.localStorage.setItem("uk_account_number", json.uk_account_number);
            beneficiary = {
              "holder_id": window.localStorage.getItem("enduser_id"),
              "asset_class": "currency",
              "asset_type": "gbp",
              "uk_sort_code": json.uk_sort_code,
              "uk_account_number": json.uk_account_number,
              "person": { "name": "Bobby the Cayman lord" }
            }
            fetch("https://play.railsbank.com/v1/customer/beneficiaries", {
              method : "POST", headers: myHeaders, mode: 'cors',
              body : JSON.stringify(beneficiary)
            }).then(function(response) { return response.json();
            }).then(function(json) {
              console.log("Successfully created beneficiary with id="+json.beneficiary_id);
              topUpRequest = {
                "ledger_id": window.localStorage.getItem("ledger_id"),
                "beneficiary_id": json.beneficiary_id,
                "payment_type": "payment-type-UK-FasterPayments",
                "amount": 1000,
                "reference": "3GBP FPS Test"
              }
              fetch("https://play.railsbank.com/v1/customer/transactions", {
                method : "POST", headers: myHeaders, mode: 'cors',
                body : JSON.stringify(topUpRequest)
              }).then(function(response) { return response.json();
              }).then(function(json) {
                console.log("Successfully added funds to beneficiary");
                data.paperwork = false;
                data.complete = true;
              }).catch(function(error) { console.log('Error adding funds go beneficiary via POST: ' + error.message); });
            }).catch(function(error) { console.log('Error creating beneficiary via POST: ' + error.message); });
          }).catch(function(error) { console.log('Error waiting for ledger to be OK: ' + error.message); });
        }).catch(function(error) { console.log('Error creating ledger via POST: ' + error.message); });
      }).catch(function(error) { console.log('Error checking user OK state: ' + error.message); });
    }).catch(function(error) { console.log('Error with your endusers POST: ' + error.message); });

    return data
  },

  // METHODS
  methods: {
    back_to_signup() {
      console.log('In back_to_signup()');
      this.$emit('change_comp', 'signup-form');
    }
  }
});

var Terms = Vue.component('terms', {
  // TEMPLATE
  template: '#terms',
  // METHODS
  methods: {
    back_to_signup() {
      this.$emit('change_comp', 'signup-form');
    }
  }
});


new Vue({
  // ELEMENT
  el: '#app',

  // DATA
  data() {
    return {
      compname: 'signup-form'
    }
  },

  // COMPONENTS
  components: {
    'signup-form': SignupForm,
    'results': Results,
    'terms': Terms
  },

  methods: {
    swapcomp: function(comp) {
      this.compname = comp;
    }
  }
});
