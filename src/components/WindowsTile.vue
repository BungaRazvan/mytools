<template>
  <a
    class="tile ripple-effect"
    :class="[
      {
        'tile-sqr': shape == 'sqr',
        'tile-sm': size == 'sm',
        'tile-lg': size != 'sm',
      },
      'tile-' + color,
    ]"
    href="#"
    @click="ripple"
  >
    <span class="content-wrapper">
      <span class="tile-content">
        <span class="tile-img"></span>
        <span class="tile-holder tile-holder-lg">
          <span class="title">{{ title }}</span>
        </span>
      </span>
    </span>
  </a>
</template>

<script>
export default {
  name: "WindowsTile",
  props: ["color", "size", "shape", "title"],
  methods: {
    ripple: (e) => {
      const el = e.target.parentElement.parentElement.parentElement;

      if (el.querySelector(".ink") == null) {
        const spanElement = document.createElement("span");
        spanElement.classList.add("ink");
        el.append(spanElement);
      }

      const ink = el.querySelector(".ink");

      // prevent quick double clicks
      ink.classList.remove("animate");

      // set .ink diametr
      if (!ink.offsetHeight && !ink.offsetWidth) {
        const cssObject = getComputedStyle(el);
        const d = Math.max(
          el.offsetHeight +
            parseFloat(cssObject.getPropertyValue("margin-top")) +
            parseFloat(cssObject.getPropertyValue("margin-bottom")),
          el.offsetWidth +
            parseFloat(cssObject.getPropertyValue("margin-left")) +
            parseFloat(cssObject.getPropertyValue("margin-right"))
        );

        ink.style.height = `${d}px`;
        ink.style.width = `${d}px`;
      }

      // get click coordinates
      const x = e.screenX - el.offsetLeft - ink.offsetWidth / 2;
      const y = e.screenY - el.offsetTop - ink.offsetHeight / 2;

      ink.style.top = `${y}px`;
      ink.style.left = `${x}px`;
      ink.classList.add("animate");
    },
  },
};
</script>
