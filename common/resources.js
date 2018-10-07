import _ from 'lodash'

export const Resources = [
  {
    name: 'user',
    label: 'Користувач',
  },

  {
    name: 'driver',
    label: 'Водій',

    methods: {
      title: res => `Водій #${res.username}`,
      link: res => '',
    },
  },
  
  {
    name: 'order',
    label: 'Замовлення',

    methods: {
      title: res => `Замовлення #${res.id}`,
      link: res => ({ name: 'operator-orders', params: { id: res.id } }),
    },
  },
]

export const ResourcesByName = _.mapKeys(Resources, value => value.name)

export const resource = object => {
  if (!object) {
    return null
  }

  const { type, ...data } = object

  const proto = ResourcesByName[type]
  if (!proto) {
    return null
  }

  return {
    get title() {
      return proto.methods.title(data)
    },

    get link() {
      return proto.methods.link(data)
    },
  }
}
