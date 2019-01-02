export default [
  {
    path: 'notice/:bulletinId',
    name: 'notice',
    component: require('../views/notice.vue'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '',
    name: 'home',
    component: require('../views/home.vue'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: 'change',
    name: 'change',
    component: require('../views/change.vue'),
    meta: {
      requireAuth: true
    }
  }
]
