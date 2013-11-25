module.exports = {
  tableName: 'uprrp_ges_departments',
  attributes: {
    code: {
      type: 'string',
      alpha: true,
      required: true,
      unique: true
    },
    name: {
      type: 'string',
      alpha: true,
      required: true
    },
    faculty: {
      type: 'string',
      alpha: true,
      required: true
    }
  }
}