<script>
import { ref } from 'vue'

export default {
  props: {
    isExpanded: Boolean
  },
  methods: {
    setCurrentView(evt, viewName) {
      if (viewName && viewName !== '') {
        this.$emit('setCurrentView', viewName)
        document.querySelectorAll('.tab').forEach((tab) => {
          tab.classList.remove('active')
        })
        evt.target.closest('.tab').classList.add('active')
      }
    },
    toggleMenu() {
      this.$emit('toggleNavigationExpanded', !this.isExpanded)
    }
  }
}
</script>

<template>
  <aside :class="`${isExpanded ? 'is-expanded' : ''}`">
    <div class="menu">
      <div class="tab active" @click="setCurrentView($event, 'knowledgeStructure')" title="Wissensstruktur">
        <font-awesome-icon class="icon" icon="sitemap" />
        <span class="text">Wissensstruktur</span>
      </div>
      <div class="tab" @click="setCurrentView($event, 'moduleSelection')" title="Modulauswahl">
        <font-awesome-icon class="icon" icon="folder" />
        <span class="text">Modulauswahl</span>
      </div>
      <div class="tab" @click="setCurrentView($event, 'learningPathManager')" title="Lernpfade">
        <font-awesome-icon class="icon" icon="bezier-curve" />
        <span class="text">Lernpfade</span>
      </div>
      <div class="tab" @click="setCurrentView($event, 'query')" title="Datenabfrage">
        <font-awesome-icon class="icon" icon="magnifying-glass" />
        <span class="text">Datenabfrage</span>
      </div>
      <div class="tab" @click="setCurrentView($event, 'settings')" title="Einstellungen">
        <font-awesome-icon class="icon" icon="gear" />
        <span class="text">Einstellungen</span>
      </div>
    </div>

    <div class="flex"></div>
    <div class="menu-toggle-wrap">
      <div class="menu-toggle" @click="toggleMenu()">
        <font-awesome-icon class="icon" icon="angles-right" />
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
aside {
  z-index: 120;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: calc(1rem + 32px);
  display: flex;
  flex-direction: column;

  background-color: var(--dark);
  color: var(--light);

  overflow: hidden;
  padding: 1rem;

  transition: 0.2s ease-in-out;

  .flex {
    flex: 1 1 0%;
  }

  .menu-toggle-wrap {
    cursor: pointer;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;

    position: relative;
    top: 0;
    transition: 0.2s ease-in-out;

    .menu-toggle {
      transition: 0.2s ease-in-out;
      .icon {
        font-size: 1rem;
        color: var(--light);
        transition: 0.2s ease-out;
      }

      &:hover {
        .icon {
          color: var(--primary);
          transform: translateX(0.5rem);
        }
      }
    }
  }

  .tab .text {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .menu {
    margin: 0 -1rem;

    .tab {
      cursor: pointer;
      display: flex;
      align-items: center;
      height: 45px;

      transition: 0.2s ease-in-out;
      padding: 0.5rem 0.9rem;

      .icon {
        width: 20px;
        height: 20px;
        color: var(--light);
        transition: 0.2s ease-in-out;
      }
      .text {
        color: var(--light);
        transition: 0.2s ease-in-out;
      }

      &:hover {
        background-color: var(--dark-alt);

        .icon,
        .text {
          color: var(--primary);
        }
      }

      &.active {
        background-color: var(--dark-alt);
        border-right: 5px solid var(--primary);

        .icon,
        .text {
          color: var(--primary);
        }
      }
    }
  }

  &.is-expanded {
    width: var(--sidebar-width);
    .menu-toggle {
      transform: rotate(-180deg);
    }

    .tab .text {
      opacity: 1;
    }

    .tab {
      .icon {
        margin-right: 1rem;
      }
    }
  }
}
</style>
