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
      console.log("In on_signup(), fullname="+this.fullname);
      //debugger;
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
