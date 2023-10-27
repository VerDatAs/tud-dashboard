<script>
import { ref } from 'vue'

export default {
  data() {
    return {
      is_expanded: ref(localStorage.getItem("is_expanded") === "true")
    }
  },  
  methods: {
    setCurrentView(evt, viewName) {
      if (viewName && viewName !== '') {
        this.$emit('setCurrentView', viewName)
        document.querySelectorAll('.tab').forEach( (tab) => {
           tab.classList.remove('active')
          }
        )
        evt.target.closest('.tab').classList.add('active');
      }
    },
    toggleMenu() {
      this.is_expanded = !this.is_expanded
	    localStorage.setItem("is_expanded", this.is_expanded)
    }
  }
}
</script>

<template>
  <aside :class="`${is_expanded ? 'is-expanded' : ''}`">
		<div class="menu">
			<div class="tab" @click="setCurrentView($event, 'knowledgeStructure')" title="Knowledge Structure">
				<font-awesome-icon class="icon" icon="sitemap"/>  
				<span class="text">Knowledge Structure</span>
			</div>
			<div class="tab" @click="setCurrentView($event,'moduleSelection')" title="Choose modules">
				<font-awesome-icon class="icon" icon="folder"/>
				<span class="text">Choose modules</span>
			</div>
			<div class="tab" @click="setCurrentView($event,'learningPathManager')" title="Learning paths">
        <font-awesome-icon class="icon" icon="bezier-curve"/>
				<span class="text">Learning paths</span>
			</div>
			<div class="tab" @click="setCurrentView($event,'settings')" title="Settings">
        <font-awesome-icon class="icon" icon="gear"/>
				<span class="text">Settings</span>
			</div>
		</div>

		<div class="flex"></div>
		<div class="menu-toggle-wrap">
			<div class="menu-toggle" @click="toggleMenu()">
				<font-awesome-icon class="icon" icon="angles-right"/>
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

  background-color: #1e293b;
  color: #f1f5f9;

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
		color: #f1f5f9;
		transition: 0.2s ease-out;
	  }
			
	  &:hover {
		.icon {
		  color: #4ade80;
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
		color: #f1f5f9;
		transition: 0.2s ease-in-out;
	  }
	  .text {
		color: #f1f5f9;
		transition: 0.2s ease-in-out;
	  }

	  &:hover {
		background-color: #334155;

		.icon, .text {
		  color: #4ade80;
		}
	  }

	  &.active {
		background-color: #334155;
		border-right: 5px solid #4ade80;

		.icon, .text {
		  color: #4ade80;
		}
	  }
	}
}

  &.is-expanded {
	  width: 250px;
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
