import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	useBlockProps,
	RichText,
	InspectorControls,
	useSettings,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	TextareaControl,
	Button,
	ColorPalette,
	BaseControl,
	Notice,
} from '@wordpress/components';
import { arrowUp, arrowDown, trash, plus, copy } from '@wordpress/icons';

const DESIGNS = [
	{ value: 'cards', label: __( 'Cards', 'clear-faq-block' ) },
	{ value: 'lines', label: __( 'Lines', 'clear-faq-block' ) },
	{ value: 'minimal', label: __( 'Minimal', 'clear-faq-block' ) },
];

/**
 * Turn pasted text into questions and answers.
 * Blocks are separated by a blank line: the first line is the question, the rest is the answer.
 * "Q:" and "A:" prefixes are removed if present.
 *
 * @param {string} text Pasted text.
 * @return {Array<{question: string, answer: string}>} Parsed items.
 */
export function parsePasted( text ) {
	const clean = ( line ) => line.replace( /^\s*(q|a|question|answer)\s*[:.)-]\s*/i, '' ).trim();
	const escape = ( s ) =>
		s.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );

	return text
		.replace( /\r\n/g, '\n' )
		.split( /\n\s*\n/ )
		.map( ( chunk ) => chunk.split( '\n' ).filter( ( l ) => l.trim() ) )
		.filter( ( lines ) => lines.length )
		.map( ( lines ) => ( {
			question: escape( clean( lines[ 0 ] ) ),
			answer: lines.slice( 1 ).map( ( l ) => escape( clean( l ) ) ).join( '<br>' ),
		} ) );
}

export default function Edit( { attributes, setAttributes } ) {
	const { items, design, exclusive, openFirst, schema, accent } = attributes;
	const [ pasted, setPasted ] = useState( '' );
	const [ palette ] = useSettings( 'color.palette' );

	const blockProps = useBlockProps( {
		className: `is-design-${ design } is-editing`,
		style: accent ? { '--cfaq-accent': accent } : undefined,
	} );

	const update = ( index, key, value ) => {
		const next = items.map( ( item, i ) => ( i === index ? { ...item, [ key ]: value } : item ) );
		setAttributes( { items: next } );
	};

	const move = ( index, delta ) => {
		const target = index + delta;
		if ( target < 0 || target >= items.length ) {
			return;
		}
		const next = [ ...items ];
		[ next[ index ], next[ target ] ] = [ next[ target ], next[ index ] ];
		setAttributes( { items: next } );
	};

	const remove = ( index ) => {
		const next = items.filter( ( _, i ) => i !== index );
		setAttributes( { items: next.length ? next : [ { question: '', answer: '' } ] } );
	};

	const duplicate = ( index ) => {
		const next = [ ...items ];
		next.splice( index + 1, 0, { ...items[ index ] } );
		setAttributes( { items: next } );
	};

	const add = () => setAttributes( { items: [ ...items, { question: '', answer: '' } ] } );

	const importPasted = () => {
		const parsed = parsePasted( pasted );
		if ( ! parsed.length ) {
			return;
		}
		const kept = items.filter( ( item ) => item.question || item.answer );
		setAttributes( { items: [ ...kept, ...parsed ] } );
		setPasted( '' );
	};

	const parsedCount = pasted ? parsePasted( pasted ).length : 0;
	const emptyCount = items.filter( ( item ) => ! item.question ).length;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Look', 'clear-faq-block' ) }>
					<BaseControl
						id="cfaq-design"
						label={ __( 'Design', 'clear-faq-block' ) }
						__nextHasNoMarginBottom
					>
						<div className="cfaq-design-picker" role="radiogroup">
							{ DESIGNS.map( ( option ) => (
								<button
									key={ option.value }
									type="button"
									role="radio"
									aria-checked={ design === option.value }
									className={ `cfaq-design-option is-${ option.value }${
										design === option.value ? ' is-selected' : ''
									}` }
									onClick={ () => setAttributes( { design: option.value } ) }
								>
									<span className="cfaq-design-preview" aria-hidden="true">
										<span />
										<span />
									</span>
									{ option.label }
								</button>
							) ) }
						</div>
					</BaseControl>
					<BaseControl
						id="cfaq-accent"
						label={ __( 'Accent colour', 'clear-faq-block' ) }
						help={ __( 'Used for the icon and the open question.', 'clear-faq-block' ) }
						__nextHasNoMarginBottom
					>
						<ColorPalette
							colors={ palette || [] }
							value={ accent || undefined }
							onChange={ ( value ) => setAttributes( { accent: value || '' } ) }
							clearable
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title={ __( 'Behaviour', 'clear-faq-block' ) }>
					<ToggleControl
						label={ __( 'Keep one answer open at a time', 'clear-faq-block' ) }
						checked={ exclusive }
						onChange={ ( value ) => setAttributes( { exclusive: value } ) }
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Open the first question', 'clear-faq-block' ) }
						checked={ openFirst }
						onChange={ ( value ) => setAttributes( { openFirst: value } ) }
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Add FAQ schema for search engines', 'clear-faq-block' ) }
						help={ __( 'Adds FAQPage structured data. Turn off if another SEO plugin already does this.', 'clear-faq-block' ) }
						checked={ schema }
						onChange={ ( value ) => setAttributes( { schema: value } ) }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={ __( 'Paste a list', 'clear-faq-block' ) } initialOpen={ false }>
					<TextareaControl
						label={ __( 'Questions and answers', 'clear-faq-block' ) }
						help={ __( 'Put the question on the first line and the answer below it. Leave a blank line between each pair.', 'clear-faq-block' ) }
						value={ pasted }
						onChange={ setPasted }
						rows={ 8 }
						placeholder={ 'How long does shipping take?\nMost orders arrive in 3 to 5 days.\n\nCan I return an item?\nYes, within 30 days.' }
						__nextHasNoMarginBottom
					/>
					<Button
						variant="primary"
						onClick={ importPasted }
						disabled={ ! parsedCount }
						style={ { marginTop: 12 } }
					>
						{ parsedCount
							? sprintf(
									/* translators: %d: number of questions found. */
									__( 'Add %d questions', 'clear-faq-block' ),
									parsedCount
							  )
							: __( 'Add questions', 'clear-faq-block' ) }
					</Button>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ items.map( ( item, index ) => (
					<div className="cfaq-item cfaq-edit-item" key={ index }>
						<div className="cfaq-edit-head">
							<span className="cfaq-edit-number" aria-hidden="true">
								{ index + 1 }
							</span>
							<RichText
								tagName="div"
								className="cfaq-question cfaq-question-text"
								value={ item.question }
								onChange={ ( value ) => update( index, 'question', value ) }
								placeholder={ __( 'Type a question…', 'clear-faq-block' ) }
								allowedFormats={ [ 'core/bold', 'core/italic' ] }
								aria-label={ sprintf(
									/* translators: %d: question number. */
									__( 'Question %d', 'clear-faq-block' ),
									index + 1
								) }
							/>
							<div className="cfaq-edit-tools">
								<Button
									icon={ arrowUp }
									size="small"
									label={ __( 'Move up', 'clear-faq-block' ) }
									onClick={ () => move( index, -1 ) }
									disabled={ index === 0 }
								/>
								<Button
									icon={ arrowDown }
									size="small"
									label={ __( 'Move down', 'clear-faq-block' ) }
									onClick={ () => move( index, 1 ) }
									disabled={ index === items.length - 1 }
								/>
								<Button
									icon={ copy }
									size="small"
									label={ __( 'Duplicate', 'clear-faq-block' ) }
									onClick={ () => duplicate( index ) }
								/>
								<Button
									icon={ trash }
									size="small"
									label={ __( 'Remove', 'clear-faq-block' ) }
									onClick={ () => remove( index ) }
									isDestructive
								/>
							</div>
						</div>
						<RichText
							tagName="div"
							className="cfaq-answer"
							value={ item.answer }
							onChange={ ( value ) => update( index, 'answer', value ) }
							placeholder={ __( 'Type the answer…', 'clear-faq-block' ) }
							aria-label={ sprintf(
								/* translators: %d: question number. */
								__( 'Answer %d', 'clear-faq-block' ),
								index + 1
							) }
						/>
					</div>
				) ) }

				<div className="cfaq-edit-footer">
					<Button variant="secondary" icon={ plus } onClick={ add }>
						{ __( 'Add question', 'clear-faq-block' ) }
					</Button>
					{ emptyCount > 0 && items.length > 1 && (
						<Notice status="info" isDismissible={ false } className="cfaq-edit-notice">
							{ __( 'Questions left empty are hidden on your site.', 'clear-faq-block' ) }
						</Notice>
					) }
				</div>
			</div>
		</>
	);
}
