<template>
  <div class="build">
    <label class="build-label">
      <i class="material-icons edit-icon">edit_note</i>
      <span>Build #1</span>
      <i class="material-icons delete-icon">delete</i>
    </label>
    <div class="build-characters">
      <div class="character">
        <i class="material-icons">add</i>
      </div>
      <div class="character">
        <i class="material-icons">add</i>
      </div>
      <div class="character">
        <i class="material-icons">add</i>
      </div>
      <div class="character">
        <i class="material-icons">add</i>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.build {
  .build-label {
    display: flex;
    align-items: center;
    align-content: center;
    font-size: 40px;
  }

  i {
    font-size: 40px;
    padding-right: 5px;
    padding-bottom: 5px;
    cursor: pointer;

    &.edit-icon {
      &:hover {
        color: #108718;
      }
    }

    &.delete-icon {
      margin-left: auto;
      margin-right: 10px;

      &:hover {
        color: #6c1c1c;
      }
    }

    &:last-child {
      float: right;
    }
  }

  .build-characters {
    display: flex;

    .character {
      margin: 10px;
      width: 105px;
      height: 105px;
      background-color: #1c1d1e;
      border-radius: 20%;
      justify-content: center;
      align-items: center;
      display: flex;
      cursor: pointer;

      i {
        font-size: 100%;
        color: #737476;
      }
    }
  }
}
</style>

<script>
export default {
  name: "Build",
};
</script>
