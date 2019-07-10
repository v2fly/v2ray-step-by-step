function extend (to, from) {
  for (var key in from) {
    to[key] = from[key];
  }
  return to;
}

export default ({Vue}) => {
  Vue.config.optionMergeStrategies.methods = function (parentVal, childVal) {
    if (!childVal) return parentVal;
    if (!parentVal) return childVal;

    var ret = Object.create(null);

    extend(ret, childVal);
    extend(ret, parentVal);

    return ret;
  }

  Vue.mixin({
    methods: {
      createEditLink (repo, docsRepo, docsDir, docsBranch, path) {
        const outboundRE = /^(https?:|mailto:|tel:|[a-zA-Z]{4,}:)/
        const endingSlashRE = /\/$/

        const base = outboundRE.test(docsRepo)
              ? docsRepo
              : `https://github.com/${docsRepo}`
        return (
          base.replace(endingSlashRE, '')
            + `/edit`
            + `/${docsBranch}/`
            + (docsDir ? docsDir.replace(endingSlashRE, '') + '/' : '')
            + 'zh_CN/'
            + path
        )
      }
    }
  });
}
