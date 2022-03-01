
/**
 * @imports
 */
import CodeBlock from './CodeBlock.js';
import Effect from './Effect.js';

/**
 * @Console
 */
export default class Console extends CodeBlock( Effect ) {

    bind( subscriptFunction, autoRender = true ) {
        if ( autoRender ) {
            // Sets both textarea and codeBlock
            this.innerHTML = subscriptFunction.originalSource;
        }
        setTimeout( () => {
            if ( !this._codeBlock.textContent.length ) return;
            let runtime = subscriptFunction.runtime;
            super.bind( { runtime, graph: runtime.graph } );
        }, 0 );
    }

    createRef( refBinding ) { }

    getTextNodes( from = null ) {
        return super.getTextNodes( from || this._codeBlock );
    }

    /**
     * ----------
     *  CSS
     * ----------
     */

    get css() {
        return super.css.concat([
            `
            .ref-identifier:is(.path-hover, .path-runtime-active) {
                text-decoration: underline;
            }
            .ref-identifier:is(.path-runtime-active) {
            }

            .ref-identifier.cause {
                cursor: default;
            }

            .ref-identifier.affected {
                cursor: pointer;
            }

            .ref-identifier.cause:is(.path-hover, .path-runtime-active) {
                color: aqua;
            }
            .token.keyword .ref-identifier.cause:is(.path-hover, .path-runtime-active) {
                color: mediumturquoise;
            }
            
            .ref-identifier.affected:is(.path-hover, .path-runtime-active) {
                color: yellowgreen;
            }

            .ref-identifier.cause.affected:is(.path-hover, .path-runtime-active) {
                color: lightgreen;
            }

            subscript-effect.block-hover,
            subscript-effect.block-runtime-active {
                outline: 1px dashed gray;
                outline-offset: 0.1rem;
                border-radius: 0.1rem;
                /*
                background-color: darkblue;
                */
            }
            subscript-effect.block-runtime-active {
                background-color: rgba(100, 100, 100, 0.35);
            }
            `
        ]);
    }

}