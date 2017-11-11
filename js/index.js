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
    get_full_name: function get_full_name(){console.log(this.fullname)},
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
    return {
      punter: window.localStorage.getItem("fullname")
    }
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

var Transaction = Vue.component('transaction', {
  template: '#transaction',
  methods: {

  },
  data: function() {
    data = {
      dummy_transactions: []
    }
    var result;
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Authorization', 'API-Key JIG5pjp5aP1fHxRk0BSacp7h3XxWPW3x#dJ3R3l21ol80Us69dzrSRfOxLzYhPtrT9gD4LX4LaTtCf6IoXgS8bCtku3VhIGo6');
    fetch('https://play.railsbank.com/v1/customer/transactions', {
      method: 'GET',
      headers: myHeaders,
      mode: 'cors'
    }).then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log(json);
      data.dummy_transactions = json;
      return data;
    });
    return data;
  }
});

new Vue({

  // ELEMENT
  el: '#app',


  // DATA
  data() {
    return {
      compname: 'transaction'
    }
  },


  // COMPONENTS
  components: {
    'signup-form': SignupForm,
    'results': Results,
    'terms': Terms,
    'transaction': Transaction
  },

  methods: {
    swapcomp: function(comp) {
      this.compname = comp;
    }
  }

});
