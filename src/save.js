import { useBlockProps, RichText } from '@wordpress/block-editor';

/**
 * Saved markup uses native <details>/<summary>, so the accordion works with
 * no front-end JavaScript and is keyboard and screen-reader friendly by default.
 * The PHP render filter adds a unique `name` to each item when only one answer
 * may be open at a time.
 */
export default function save( { attributes } ) {
	const { items, design, exclusive, openFirst, accent } = attributes;

	const blockProps = useBlockProps.save( {
		className: `is-design-${ design }`,
		style: accent ? { '--cfaq-accent': accent } : undefined,
		'data-exclusive': exclusive ? 'true' : undefined,
	} );

	return (
		<div { ...blockProps }>
			{ items
				.filter( ( item ) => item.question )
				.map( ( item, index ) => (
					<details
						key={ index }
						className="cfaq-item"
						open={ openFirst && index === 0 ? true : undefined }
					>
						<summary className="cfaq-question">
							<RichText.Content
								tagName="span"
								className="cfaq-question-text"
								value={ item.question }
							/>
							<span className="cfaq-icon" aria-hidden="true" />
						</summary>
						<RichText.Content
							tagName="div"
							className="cfaq-answer"
							value={ item.answer }
						/>
					</details>
				) ) }
		</div>
	);
}
