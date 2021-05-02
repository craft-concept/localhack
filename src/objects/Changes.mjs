import Objects from "objects/Objects"

export let Changes = Objects.clone
  .def({
    execute() {
      return
    },
  })
  .def({
    forActor(actorId) {
      return this.where({ actorId })
    },
  })

export default Changes
