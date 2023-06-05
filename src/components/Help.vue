<script lang="ts">
export default {
  methods: {
    showHelp: function () {
      const dialog = this.$refs.dialogRef as HTMLDialogElement
      dialog.showModal()
    },
    closeHelp: function () {
      const dialog = this.$refs.dialogRef as HTMLDialogElement
      dialog.close()
    }
  }
}
</script>
<template>
  <dialog ref="dialogRef">
    <header style="display: grid; grid-auto-flow: column">
      <h2>Help</h2>
      <button @click="closeHelp" style="margin-left: auto">
        <img src="../assets/x.svg" height="20" width="20" />
      </button>
    </header>
    <h3>Links</h3>
    <a href="https://p5-marker-docs.glitch.me/" target="_">Reference</a>
    <a href="https://github.com/calebfoss/p5-marker" target="_">p5-Marker Github</a>
    <a href="https://github.com/calebfoss/marker-editor" target="_">Editor Github</a>
    <h3>Keyboard shortcuts</h3>
    <table>
      <tr>
        <td>refresh preview</td>
        <td>control + enter</td>
      </tr>
      <tr>
        <td>delete element</td>
        <td>delete</td>
      </tr>
      <tr>
        <td>move child up</td>
        <td>up arrow</td>
      </tr>
      <tr>
        <td>move child down</td>
        <td>down arrow</td>
      </tr>
      <tr>
        <td>move child to sibling</td>
        <td>left arrow</td>
      </tr>
      <tr>
        <td>parent child to above sibling</td>
        <td>shift + up arrow</td>
      </tr>
      <tr>
        <td>parent child to below sibling</td>
        <td>shift + down arrow</td>
      </tr>
    </table>
  </dialog>
</template>
